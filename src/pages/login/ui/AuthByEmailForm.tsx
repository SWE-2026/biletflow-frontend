import { useState } from 'react'
import type { OtpChallenge } from '../api/types'
import { CodeStep } from './CodeStep'
import { EmailStep } from './EmailStep'

type Step =
  | { kind: 'email'; email: string }
  | { kind: 'code'; email: string; challenge: OtpChallenge; sentAt: number }

/** Passwordless sign-in: email → one-time code. Stores the session on success. */
export function AuthByEmailForm() {
  const [step, setStep] = useState<Step>({ kind: 'email', email: '' })

  if (step.kind === 'email') {
    return (
      <EmailStep
        initialEmail={step.email}
        onCodeSent={(email, challenge) => setStep({ kind: 'code', email, challenge, sentAt: Date.now() })}
      />
    )
  }

  return (
    <CodeStep
      key={step.sentAt}
      email={step.email}
      challenge={step.challenge}
      sentAt={step.sentAt}
      onResent={(challenge) => setStep({ ...step, challenge, sentAt: Date.now() })}
      onChangeEmail={() => setStep({ kind: 'email', email: step.email })}
    />
  )
}
