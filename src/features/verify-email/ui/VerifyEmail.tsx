import { useRef, useState, type ReactNode } from 'react'
import { useSession } from '@/entities/user'
import { ApiError, getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { verifyEmailApi } from '../api/verifyEmailApi'
import { useVerifyEmailMessages, verifyEmailErrorMessages } from '../i18n/messages'
import { earlierCode, isCodeUsable } from '../lib/sentCode'
import type { SentCode } from '../model/types'
import { CodeForm } from './CodeForm'

type VerifiedEmailGateProps = {
  /** What an unverified user sees; `action` is the "Verify email" button and code form. */
  prompt?: (action: ReactNode) => ReactNode
  /** Shown once the email is verified (and to guests, who have nothing to verify). */
  children?: ReactNode
}

const showAction = (action: ReactNode) => action

/**
 * Shows `children` only to a verified account. An unverified user gets the `prompt` with an in-place
 * "Verify email" action instead: a code goes to their own address and, once entered, the verified
 * session replaces the current one. Stays mounted across that switch, so a status region can
 * announce the success while `children` appear.
 */
export function VerifiedEmailGate({ prompt = showAction, children }: VerifiedEmailGateProps) {
  const t = useVerifyEmailMessages()
  const user = useSession()?.user
  const [verifiedUserId, setVerifiedUserId] = useState<string>()
  const justVerified = user !== undefined && verifiedUserId === user.id

  return (
    <>
      {user && !user.emailVerified
        ? prompt(
            // A different account starts over
            <VerifyEmailAction key={user.id} email={user.email} onVerified={() => setVerifiedUserId(user.id)} />,
          )
        : children}
      <p role="status" className="text-sm text-green-800 empty:hidden">
        {justVerified ? `✓ ${t.verified}` : ''}
      </p>
    </>
  )
}

/** The "Verify email" action alone, e.g. on the account page; nothing once the email is verified. */
export function VerifyEmail() {
  return <VerifiedEmailGate />
}

type VerifyEmailActionProps = { email: string; onVerified: () => void }

function VerifyEmailAction({ email, onVerified }: VerifyEmailActionProps) {
  const t = useVerifyEmailMessages()
  const [sent, setSent] = useState<SentCode>()
  // Set when the API deleted or locked the code, so reopening the form asks for a new one
  const [codeDead, setCodeDead] = useState(false)
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string>()
  const refocusButton = useRef(false)

  const start = async () => {
    // A code sent earlier still works, so reopening the form doesn't hit the resend cooldown
    if (!codeDead && isCodeUsable(sent, Date.now())) {
      setOpen(true)
      return
    }
    setError(undefined)
    setSending(true)
    try {
      const challenge = await verifyEmailApi.requestCode(email)
      setSent({ challenge, sentAt: Date.now() })
      setCodeDead(false)
      setOpen(true)
    } catch (err) {
      // A code sent moments ago (e.g. before a reload) is still in the inbox and still works
      if (err instanceof ApiError && err.code === 'resend_too_soon' && !codeDead) {
        setSent(earlierCode(Date.now()))
        setOpen(true)
      } else {
        setError(getErrorMessage(err, verifyEmailErrorMessages(t)))
      }
    } finally {
      setSending(false)
    }
  }

  if (open && sent) {
    return (
      <CodeForm
        key={sent.sentAt}
        email={email}
        sent={sent}
        onResent={(challenge) => {
          setSent({ challenge, sentAt: Date.now() })
          setCodeDead(false)
        }}
        onCancel={() => {
          refocusButton.current = true
          setOpen(false)
        }}
        onCodeDead={() => setCodeDead(true)}
        onVerified={onVerified}
      />
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        {t.intro(<span className="font-medium text-gray-900">{email}</span>)}
      </p>
      <Button
        ref={(button) => {
          // Back from the code form: put focus where the user started
          if (button && refocusButton.current) {
            refocusButton.current = false
            button.focus()
          }
        }}
        variant="secondary"
        onClick={() => void start()}
        loading={sending}
      >
        {sending ? t.sendingCode : t.verifyEmail}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
