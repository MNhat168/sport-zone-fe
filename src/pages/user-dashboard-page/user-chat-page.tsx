import { useEffect, useState, useRef } from "react"
import { UserDashboardTabs } from "@/components/tabs/user-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { UserDashboardHeader } from "@/components/header/user-dashboard-header"
import { PageWrapper } from "@/components/layouts/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { getChatRooms, getChatRoom, startChat, markAsRead } from "@/features/chat/chatThunk"
import { setCurrentRoom, addMessage } from "@/features/chat/chatSlice"
import { webSocketService } from "@/features/chat/websocket.service"

export default function UserChatPage() {
  const dispatch = useAppDispatch()
  const { rooms, currentRoom, connected } = useAppSelector((s) => s.chat)
  const [message, setMessage] = useState("")
  const [fieldOwnerId, setFieldOwnerId] = useState("")
  const messagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      console.log("[UserChat] connecting socket and restoring last room if available")
      webSocketService.connect(token)

      // Immediately restore last room from localStorage to avoid blank UI
      const lastId = localStorage.getItem("last_chat_room_id")
      console.log('[UserChat] localStorage last_chat_room_id', lastId)
      if (lastId) {
        console.log("[UserChat] restore last room (pre-fetch)", lastId)
        try {
          const raw = localStorage.getItem(`chat_history_${lastId}`)
          console.log('[UserChat] localStorage read chat_history', { key: `chat_history_${lastId}`, raw })
          const stored = JSON.parse(raw || '[]')
          const pre = { _id: lastId, messages: stored } as any
          dispatch(setCurrentRoom(pre))
        } catch {}
        if (webSocketService.isConnected()) {
          webSocketService.joinChatRoom(lastId)
        }
        // Fetch server room to merge
        dispatch(getChatRoom(lastId))
      }

      // Then fetch rooms list for sidebar
      dispatch(getChatRooms()).then((res: any) => {
        // If we didn’t have a last room, pick the first available
        const rooms = (res?.payload as any[]) || []
        if (!lastId && rooms.length > 0) {
          const firstId = rooms[0]._id
          console.log("[UserChat] auto-select first room", firstId)
          localStorage.setItem("last_chat_room_id", String(firstId))
          try {
            const raw = localStorage.getItem(`chat_history_${firstId}`)
            console.log('[UserChat] localStorage read chat_history', { key: `chat_history_${firstId}`, raw })
            const stored = JSON.parse(raw || '[]')
            const pre = { ...rooms[0], messages: stored }
            dispatch(setCurrentRoom(pre))
          } catch {}
          dispatch(getChatRoom(firstId))
          if (webSocketService.isConnected()) {
            webSocketService.joinChatRoom(firstId)
          }
        }
      })
    }
  }, [dispatch])

  useEffect(() => {
    if (connected && currentRoom?._id) {
      console.log("[UserChat] connected; joining and marking read", currentRoom._id)
      webSocketService.joinChatRoom(currentRoom._id)
      webSocketService.markAsRead(currentRoom._id)
      dispatch(markAsRead(currentRoom._id))
    }
  }, [connected, currentRoom, dispatch])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [currentRoom?.messages?.length])

  const handleSelectRoom = async (roomId: string) => {
    if (currentRoom?._id === roomId) {
      console.log("[UserChat] reselect same room; skipping refetch")
      // Ensure join for safety
      if (webSocketService.isConnected()) {
        webSocketService.joinChatRoom(roomId)
      }
      return
    }
    console.log("[UserChat] select room", roomId)
    await dispatch(getChatRoom(roomId))
    localStorage.setItem("last_chat_room_id", roomId)
    // Join via socket using the selected room id; reducer will set currentRoom on fulfillment
    if (webSocketService.isConnected()) {
      console.log("[UserChat] join room", roomId)
      webSocketService.joinChatRoom(roomId)
    }
  }

  const handleStartChat = async () => {
    if (!fieldOwnerId.trim()) return
    console.log("[UserChat] start chat with", fieldOwnerId.trim())
    const result = await dispatch(startChat({ fieldOwnerId: fieldOwnerId.trim() }))
    console.log("[UserChat] startChat result", result)
    const newRoom: any = (result as any).payload?.data || (result as any).payload
    if (webSocketService.isConnected() && newRoom?._id) {
      console.log("[UserChat] join new room", newRoom._id)
      webSocketService.joinChatRoom(newRoom._id)
      // Fetch full room detail to populate messages
      const roomDetail: any = await dispatch(getChatRoom(newRoom._id))
      const fullRoom = (roomDetail as any)?.payload?.data || (roomDetail as any)?.payload || newRoom
      dispatch(setCurrentRoom(fullRoom))
      localStorage.setItem("last_chat_room_id", String(newRoom._id))
    }
  }

  const send = () => {
    if (!currentRoom?._id || !message.trim()) return
    const content = message.trim()
    console.log("[UserChat] send", { room: currentRoom._id, content })
    // Ensure we are joined to the room before sending
    if (webSocketService.isConnected()) {
      webSocketService.joinChatRoom(currentRoom._id)
    }
    // Optimistic UI update
    const optimisticMsg = {
      _id: `tmp-${Date.now()}`,
      sender: "me",
      type: "text",
      content,
      attachments: [],
      isRead: true,
      sentAt: new Date().toISOString(),
    }
    // Dispatch to chatSlice to render immediately
    dispatch(
      addMessage({
        chatRoomId: currentRoom._id,
        message: optimisticMsg as any,
        chatRoom: { ...currentRoom, lastMessageAt: optimisticMsg.sentAt, lastMessageBy: optimisticMsg.sender },
      })
    )
    // Persist optimistic message immediately to ensure visibility after reload
    try {
      const key = `chat_history_${currentRoom._id}`
      const raw = localStorage.getItem(key)
      const prev = JSON.parse(raw || '[]')
      const updated = Array.isArray(prev) ? [...prev, optimisticMsg] : [optimisticMsg]
      localStorage.setItem(key, JSON.stringify(updated))
      localStorage.setItem('last_chat_room_id', String(currentRoom._id))
      console.log('[UserChat] persisted optimistic message', { key, count: updated.length })
    } catch {}
    // Send over socket
    webSocketService.sendMessage({ chatRoomId: currentRoom._id, content })
    setMessage("")
  }

  const onMessageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <NavbarDarkComponent />
      <PageWrapper>
        <UserDashboardHeader />
        <UserDashboardTabs />
        <div className="container mx-auto px-12 py-8">
          <div className="space-y-8">
            <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold mb-2 text-start">Trò chuyện</CardTitle>
                <p className="text-muted-foreground text-start">Giao tiếp với huấn luyện viên và chủ sân</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="flex gap-2 mb-3">
                      <input
                        value={fieldOwnerId}
                        onChange={(e) => setFieldOwnerId(e.target.value)}
                        placeholder="Field Owner Profile ID"
                        className="flex-1 border rounded px-2 py-1"
                      />
                      <button onClick={handleStartChat} className="border rounded px-3 py-1">Start</button>
                    </div>
                    <ul className="space-y-2">
                      {rooms.length > 0 ? (
                        rooms.map((r) => (
                          <li key={r._id}>
                            <button
                              onClick={() => handleSelectRoom(r._id)}
                              className="w-full text-left border rounded px-3 py-2 hover:bg-gray-50"
                            >
                              {(r.fieldOwner?.facilityName as string) || r._id}
                              {r.hasUnread ? " •" : ""}
                            </button>
                          </li>
                        ))
                      ) : currentRoom ? (
                        <li key={currentRoom._id}>
                          <button
                            onClick={() => handleSelectRoom(currentRoom._id)}
                            className="w-full text-left border rounded px-3 py-2 hover:bg-gray-50"
                          >
                            {String((currentRoom as any)?.fieldOwner?.facilityName) || currentRoom._id}
                          </button>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                  <div className="md:col-span-2">
                    <div ref={messagesRef} className="border rounded p-3 h-80 overflow-auto mb-3 bg-gray-50">
                      {currentRoom?.messages?.length ? (
                        currentRoom.messages.map((m) => {
                          const isMe = String(m.sender) === 'me' || String(m.sender) === String((currentRoom as any)?.user?._id)
                          return (
                            <div
                              key={m._id}
                              className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
                            >
                              <div
                                className={`max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                                  isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none border'
                                }`}
                              >
                                <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                                <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                  {new Date(m.sentAt || Date.now()).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-muted-foreground">Chọn phòng để xem tin nhắn</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={onMessageKeyDown}
                        className="flex-1 border rounded px-3 py-2"
                        placeholder="Nhập tin nhắn"
                      />
                      <button onClick={send} className="border rounded px-4 py-2">Gửi</button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
