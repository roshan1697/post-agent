"use client";

import { useState } from "react";
import { Menu, Search, Settings, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChatMessages } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessages[]>([
  
  ]);
  const [input, setInput] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [text,setText] = useState('')

  const fetchStream = ()=>{
    
  }
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return
    
    setMessages(prevmessages=> [...prevmessages, { role: "user", content: input }]);
    setInput("")


    
    try {
      
      const res = await axios.post('http://127.0.0.1:8000/chat',
        {
          user:input
        }
        
      )
      console.log(res.data)
      const reader = res.data.getReader()
      console.log(reader)
      if(reader){
        while(true){
          const {done, value} = await reader.read()
          if(done) break
          // setText(prev => prev + new TextDecoder().decode(value))
          console.log(value)
        }
      }
      // setMessages(prevmessages=> [...prevmessages,{role:'chatbot' , content:res.data}])
      
    } catch(err){
      console.log(err)
    }
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "h-full bg-card border-r transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 space-y-4">
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <User className="mr-2 h-5 w-5" />
            Account
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="border-b">
          <div className="flex items-center p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className={cn(isSidebarOpen && "hidden")}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        {messages.length === 0 ? <div className="flex-1 overflow-auto p-4 space-y-4 text-center text-4xl">How may I help you?</div> : <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-full",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>}

        {/* Input Area */}
        <div className=" p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="resize-none "
              />
              <Button
                type="button"
                variant={isSearchActive ? "secondary" : "ghost"}
                size="icon"
                onClick={toggleSearch}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 transition-colors",
                  isSearchActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
            <Button className=" " type="submit">Send</Button>
          </form>
        </div>
      </div>
      {/* <p>{text}</p> */}
    </div>
  );
}