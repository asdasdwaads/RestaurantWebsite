import { FormEvent } from "react"

export const BookContainer = ({ 
  children, title, styles, onSubmit
}: { 
  children?: React.ReactNode,
  title?: string,
  styles?: { 
    container?: string, 
    title?: string, 
    children?: string
  },
  onSubmit?: (event: FormEvent) => void
}) => {
  return (
    <div className={`${styles?.container} flex flex-col items-center gap-4 border-2 border-dark rounded-[10px] p-6 bg-[#0000005d]`}>
      <div>
        <h1 className={`${styles?.title}`}>{title}</h1>
      </div>
      {onSubmit ? (
        <form className={`${styles?.children}`} onSubmit={onSubmit}>
          {children}
        </form>
      ) : (
        <div className={`${styles?.children}`}>
          {children}
        </div>
      )}
    </div>
  )
}