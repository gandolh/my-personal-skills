# Field, input and validation

A labelled text field with its description and error, and a form that
shows the server's errors beside the fields they belong to.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

## The field

`Field.Root` wires the label, the control, the description and the error
together (ids, `aria-describedby`, the invalid state), and carries the
browser's own validity (`required`, `type="email"`, `pattern`) into
`Field.Error`.

```tsx
// src/components/ui/TextField.tsx
import { Field } from "@base-ui/react/field";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface TextFieldProps extends Omit<ComponentProps<typeof Field.Control>, "className" | "name"> {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  /** A check run after the browser's own; return the message, or null when the value is fine. */
  validate?: ComponentProps<typeof Field.Root>["validate"];
  className?: string;
}

/**
 * A labelled input with its description and error. Any input type works:
 * text, email, date and time stay native inputs (Q16).
 */
export function TextField({ name, label, description, validate, className, ...control }: TextFieldProps) {
  return (
    <Field.Root name={name} validate={validate} className={cn("flex flex-col gap-1", className)}>
      <Field.Label className="text-meta font-medium text-ink">{label}</Field.Label>
      <Field.Control
        {...control}
        className={cn(
          "h-9 rounded-control border border-line bg-raised px-2.5 text-body text-ink outline-none",
          "placeholder:text-ink-muted focus:border-accent focus:ring-2 focus:ring-accent/30",
          "data-invalid:border-danger data-disabled:opacity-50",
        )}
      />
      {description && <Field.Description className="text-meta text-ink-muted">{description}</Field.Description>}
      <Field.Error className="text-meta text-danger" />
    </Field.Root>
  );
}
```

`Field.Error` with no children shows the browser's message for the failed
check. To word it yourself, give it children and `match`:
`<Field.Error match="valueMissing">Enter a title</Field.Error>`.

## The form

```tsx
// src/components/ui/Form.tsx
import { Form as BaseForm } from "@base-ui/react/form";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

type FormProps = Omit<ComponentProps<typeof BaseForm>, "className"> & { className?: string };

/** Base UI's Form: native submission and validation, plus `errors` from the server, keyed by field name. */
export function Form({ className, ...props }: FormProps) {
  return <BaseForm {...props} className={cn("flex flex-col gap-4", className)} />;
}
```

A form that sends, and shows what the server refused beside the field it
names. An error clears when that field's value changes.

```tsx
// src/features/account/ChangeEmail.tsx
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Form } from "../../components/ui/Form";
import { TextField } from "../../components/ui/TextField";

type Errors = Record<string, string>;

export function ChangeEmail({ save }: { save: (email: string) => Promise<Errors | null> }) {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);

  return (
    <Form
      errors={errors}
      onFormSubmit={(values) => {
        setPending(true);
        void save(String(values.email))
          .then((refused) => setErrors(refused ?? {}))
          .finally(() => setPending(false));
      }}
    >
      <TextField
        name="email"
        type="email"
        label="Email"
        description="Sign-in links go here."
        required
        autoComplete="email"
      />
      <Button type="submit" variant="primary" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save"}
      </Button>
    </Form>
  );
}
```

## Adapt to the app

- The input's height and radius match the app's buttons, so a field and its
  submit line up.
- Error text uses the app's danger token; an app that shows errors with an
  icon adds it before the text, `aria-hidden`.

## What to keep in mind

- **Native stays native** (Q16, rule 13): text, email, number, date and time
  inputs are `<input>`s with their types. A phone's own date and time
  pickers beat any popup.
- **`validationMode`** on `Field.Root` is `onSubmit` by default: fields
  validate on submit, then again as they change. `onBlur` suits a long form.
- **A control's value must match what the server takes.** A todo `PATCH`
  took `completed` as `0 | 1 | boolean`, and the client sent `0 | 1`; a
  stricter schema would have refused every tick. Before a wrapper replaces a
  native control, check the payload the server already accepts.
- **A Select, Combobox, Checkbox or Switch inside `Field.Root`** gets its
  label and form value from the field (`name` on `Field.Root`).
- **Tests** find a field by its label: `getByRole("textbox", { name:
  "Email" })` (rule 17).
