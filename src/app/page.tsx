"use client";

import React, { useRef, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Paper,
  Avatar,
  Container,
  IconButton,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import SchoolIcon from "@mui/icons-material/School";
import { useState } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setMessage("");
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessage = "";
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "" },
      ]);

      const processText = async function ({
        done,
        value,
      }: ReadableStreamReadResult<Uint8Array>): Promise<void> {
        if (done) {
          return;
        }
        const text = decoder.decode(value, { stream: true });
        assistantMessage += text;
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: assistantMessage,
          };
          return newMessages;
        });
        const nextChunk = await reader.read();
        await processText(nextChunk);
      };

      await processText(await reader.read());
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, an error occurred. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="md"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2, backgroundColor: "primary.main", color: "white" }}>
            <Typography variant="h6">Rate My Professor Assistant</Typography>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.role === "assistant" ? "flex-start" : "flex-end",
                  mb: 2,
                }}
              >
                {msg.role === "assistant" && (
                  <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>
                    <SchoolIcon />
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor:
                      msg.role === "assistant"
                        ? "primary.light"
                        : "secondary.light",
                    maxWidth: "70%",
                  }}
                >
                  <Typography variant="body1">{msg.content}</Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={{ p: 2, backgroundColor: "background.default" }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
                multiline
                maxRows={3}
              />
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                sx={{ alignSelf: "flex-end" }}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

// "use client";

// import { Box, Button, Stack, TextField } from "@mui/material";
// import { useState } from "react";

// export default function Home() {
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
//     },
//   ]);
//   const [message, setMessage] = useState("");

//   const sendMessage = async () => {
//     if (!message.trim()) return; // Prevent sending empty messages

//     setMessage("");
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { role: "user", content: message },
//       { role: "assistant", content: "" },
//     ]);

//     try {
//       const response = await fetch("/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify([...messages, { role: "user", content: message }]),
//       });

//       if (!response.body) {
//         throw new Error("Response body is null");
//       }

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();

//       const processText = async function ({
//         done,
//         value,
//       }: ReadableStreamReadResult<Uint8Array>): Promise<string> {
//         if (done) {
//           return "";
//         }
//         const text = decoder.decode(value, { stream: true });
//         setMessages((prevMessages) => {
//           const lastMessage = prevMessages[prevMessages.length - 1];
//           const otherMessages = prevMessages.slice(0, prevMessages.length - 1);
//           return [
//             ...otherMessages,
//             { ...lastMessage, content: lastMessage.content + text },
//           ];
//         });
//         const nextChunk = await reader.read();
//         return text + (await processText(nextChunk));
//       };

//       await processText(await reader.read());
//     } catch (error) {
//       console.error("Error in sendMessage:", error);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { role: "assistant", content: "Sorry, an error occurred. Please try again." },
//       ]);
//     }
//   };

//   return (
//     <Box
//       width="100vw"
//       height="100vh"
//       display="flex"
//       flexDirection="column"
//       justifyContent="center"
//       alignItems="center"
//     >
//       <Stack
//         direction="column"
//         width="500px"
//         height="700px"
//         border="1px solid black"
//         p={2}
//         spacing={3}
//       >
//         <Stack
//           direction="column"
//           spacing={2}
//           flexGrow={1}
//           overflow="auto"
//           maxHeight="100%"
//         >
//           {messages.map((message, index) => (
//             <Box
//               key={index}
//               display="flex"
//               justifyContent={
//                 message.role === "assistant" ? "flex-start" : "flex-end"
//               }
//             >
//               <Box
//                 bgcolor={
//                   message.role === "assistant"
//                     ? "primary.main"
//                     : "secondary.main"
//                 }
//                 color="white"
//                 borderRadius={16}
//                 p={3}
//               >
//                 {message.content}
//               </Box>
//             </Box>
//           ))}
//         </Stack>
//         <Stack direction="row" spacing={2}>
//           <TextField
//             label="Message"
//             fullWidth
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={(e) => {
//               if (e.key === 'Enter') {
//                 sendMessage();
//               }
//             }}
//           />
//           <Button variant="contained" onClick={sendMessage}>
//             Send
//           </Button>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// }
