import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group pointer-events-auto"
      toastOptions={{
        classNames: {
          toast: "pointer-events-auto",
        },
        style: {
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #1e293b',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
        }
      }}
      {...props}
      duration={2000}
    />
  )
}

export { Toaster }
