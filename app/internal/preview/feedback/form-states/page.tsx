import { HandCoins, Mail, Phone } from 'lucide-react';
import { notFound } from 'next/navigation';
import { FormField } from '@/components/feedback/form-field';
import { MemberPreviewChrome } from '../../member/_chrome';

/**
 * Dev-only preview of `<FormField>` in all four states. Mirrors the
 * handoff `FormStatesRef` artboard. Production builds 404 this route.
 */
export default function FormStatesPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <MemberPreviewChrome
      current="home"
      title="Form states · reference"
      sub="For developer reference, every input variant in one place"
    >
      <div className="grid max-w-[800px] grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          label="Default · empty"
          placeholder="ngozi@chamasave.ng"
          icon={Mail}
        />
        <FormField
          label="Default · filled"
          defaultValue="ngozi@chamasave.ng"
          icon={Mail}
        />
        <FormField
          label="Focus"
          defaultValue="+234 803 555"
          state="focus"
          icon={Phone}
          help="Continue typing, we'll send the code when ready"
        />
        <FormField
          label="Error"
          defaultValue="123"
          state="error"
          icon={Phone}
          help="Phone number must include country code"
        />
        <FormField
          label="Disabled"
          defaultValue="locked@account.ng"
          state="disabled"
          icon={Mail}
          help="Reach out to support to change this"
        />
        <FormField
          label="With hint"
          defaultValue="₦ 12,000"
          hint="weekly"
          icon={HandCoins}
        />
      </div>
    </MemberPreviewChrome>
  );
}
