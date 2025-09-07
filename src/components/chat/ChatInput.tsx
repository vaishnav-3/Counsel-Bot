// "use client"

// import * as React from "react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"

// type ChatInputProps = {
//   onSend: (message: string) => void
//   isLoading: boolean
// }

// export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
//   const [value, setValue] = React.useState("")
 
//   function submitMessage() {
//     const text = value.trim()
//     if (!text || isLoading) return
//     onSend(text)
//     setValue("")
//   }

//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault()
//         submitMessage()
//       }}
//       className="w-full"
//     >
//       <div className="flex items-center gap-2">
//         <label htmlFor="chat-input" className="sr-only">
//           Message
//         </label>
//         <Input
//           id="chat-input"
//           value={value}
//           onChange={(e) => setValue(e.target.value)}
//           placeholder="Type your message..."
//           disabled={isLoading}
//           autoComplete="off"
//           className="flex-1"
//         />
//         <Button type="submit" disabled={isLoading || value.trim().length === 0}>
//           {isLoading ? "Sending..." : "Send"}
//         </Button>
//       </div>
//     </form>
//   )
// }
