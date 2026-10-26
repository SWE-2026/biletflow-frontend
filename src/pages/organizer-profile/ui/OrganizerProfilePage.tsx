import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { setSession, useSession, type Session } from '@/entities/user'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { organizerApi } from '../api/organizerApi'
import type { Organizer, OrganizerInput } from '../model/types'
import { OrganizerProfileForm } from './OrganizerProfileForm'

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <div className="mt-1 text-sm text-gray-600">{children}</div>
    </div>
  )
}

function CreateProfile({ session }: { session: Session }) {
  const navigate = useNavigate()

  const handleSubmit = async (input: OrganizerInput) => {
    const { user } = await organizerApi.create(input)
    setSession({ ...session, user })
    navigate('/organizer', { replace: true })
  }

  return (
    <>
      <p className="mb-8 text-sm text-gray-600">
        Set up an organizer profile to create and publish events. You can change these details
        later.
      </p>
      <OrganizerProfileForm
        initialValues={{
          type: 'individual',
          name: session.user.displayName,
          contactEmail: session.user.email,
          contactPhone: '',
          payoutAccountReference: '',
        }}
        submitLabel="Become an organizer"
        pendingLabel="Creating profile…"
        onSubmit={handleSubmit}
      />
    </>
  )
}

const toInput = ({ type, name, contactEmail, contactPhone, payoutAccountReference }: Organizer) => ({
  type,
  name,
  contactEmail,
  contactPhone,
  payoutAccountReference,
})

function EditProfile() {
  const { state, reload, setData } = useAsyncData('organizer-profile', (signal) =>
    organizerApi.get(signal),
  )

  if (state.status === 'loading') return <LoadingState label="Loading your profile…" />
  if (state.status === 'error')
    return <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />

  return (
    <OrganizerProfileForm
      initialValues={toInput(state.data)}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      savedMessage="Profile saved."
      onSubmit={async (input) => setData(await organizerApi.update(input))}
    />
  )
}

function ProfileContent({ session }: { session: Session }) {
  const { role, emailVerified, email } = session.user

  if (role === 'organizer')
    return (
      <div className="mt-6">
        <EditProfile />
      </div>
    )
  if (role !== 'customer')
    return (
      <Notice title="Not available for this account">
        Staff and admin accounts can't create an organizer profile. Sign in with a personal account
        to organize events.
      </Notice>
    )
  if (!emailVerified)
    return (
      <Notice title="Verify your email first">
        Organizers need a verified email address. Sign out, then sign in again with an email code
        sent to <span className="font-medium text-gray-900">{email}</span>. That verifies it.
      </Notice>
    )
  return <CreateProfile session={session} />
}

export function OrganizerProfilePage() {
  const session = useSession()
  const isOrganizer = session?.user.role === 'organizer'

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">
        {isOrganizer ? 'Organizer profile' : 'Become an organizer'}
      </h1>
      {session && <ProfileContent session={session} />}
    </div>
  )
}
