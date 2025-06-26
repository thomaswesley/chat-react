'use client'

import { useEffect, useRef, useState } from 'react'

import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Popper from '@mui/material/Popper'

import AvatarWithBadge from './AvatarWithBadge'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CustomIconButton from '@core/components/mui/IconButton'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { getActiveUserData } from '@/redux-store/slices/chat'
import PersonIcon from '@mui/icons-material/Person'
import CustomAvatar from '@core/components/mui/Avatar'
import { useSettings } from '@core/hooks/useSettings'
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'
import { apiPaganaPizzaria } from '@utils/api'
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const AvatarsIcon = () => {
  return (
    <div className='flex gap-4'>      
      <CustomAvatar sx={{ bgcolor: 'grey.500' }} >
        <PersonIcon sx={{ color: '#fff' }} />
      </CustomAvatar>
    </div>
  )
}

// Emoji Picker Component for selecting emojis
const EmojiPicker = ({ onChange, isBelowSmScreen, openEmojiPicker, setOpenEmojiPicker, anchorRef }) => {

  return (
    <>
      <Popper
        open={openEmojiPicker}
        transition
        disablePortal
        placement='top-start'
        className='z-[12]'
        anchorEl={anchorRef.current}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'top-start' ? 'right top' : 'left top' }}>
            <Paper>
              <ClickAwayListener onClickAway={() => setOpenEmojiPicker(false)}>
                <span>
                  <Picker
                    emojiSize={18}
                    theme='light'
                    data={data}
                    maxFrequentRows={1}
                    onEmojiSelect={emoji => {
                      onChange(emoji.native)
                      setOpenEmojiPicker(false)
                    }}
                    {...(isBelowSmScreen && { perLine: 8 })}
                  />
                </span>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

// Formats the chat data into a structured format for display.
const formatedChatData = (chats, profileUser) => {
  const formattedChatData = []
  let chatMessageSenderId = chats[0] ? chats[0].senderId : profileUser.id
  let msgGroup = {
    senderId: chatMessageSenderId,
    messages: []
  }

  chats.forEach((chat, index) => {
    if (chatMessageSenderId === chat.senderId) {
      msgGroup.messages.push({
        time: chat.time,
        message: chat.message,
        msgStatus: chat.msgStatus
      })
    } else {
      chatMessageSenderId = chat.senderId
      formattedChatData.push(msgGroup)
      msgGroup = {
        senderId: chat.senderId,
        messages: [
          {
            time: chat.time,
            message: chat.message,
            msgStatus: chat.msgStatus
          }
        ]
      }
    }

    if (index === chats.length - 1) formattedChatData.push(msgGroup)
  })

  return formattedChatData
}

// Renders the user avatar with badge and user information
const UserAvatar = ({ activeUser, setUserProfileLeftOpen, setBackdropOpen }) => (
  <div
    className='flex items-center gap-4 cursor-pointer'
    onClick={() => {
      setUserProfileLeftOpen(true)
      setBackdropOpen(true)
    }}
  >
    <AvatarWithBadge
      alt={activeUser?.fullName}
      src='/images/avatars/scarlett-johansson.png'
      color={activeUser?.avatarColor}
      badgeColor='success'
    />
    <div>
      <Typography color='text.primary'>{activeUser?.fullName}</Typography>
      <Typography variant='body2'>{activeUser?.role}</Typography>
    </div>
  </div>
)

const ChatWrapper = () => {

  const socket = io(process.env.NEXT_PUBLIC_APP_PAGANA_PIZZARIA_NODE);
  const [messages, setMessages] = useState([])

  const [backdropOpen, setBackdropOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messageInputRef = useRef(null)
  const { settings } = useSettings()
  const isBelowLgScreen = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const [userProfileRightOpen, setUserProfileRightOpen] = useState(false)
  const scrollRef = useRef(null)
  const [msg, setMsg] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false)

  const anchorRef = useRef(null)
  const open = Boolean(anchorEl)

  const chatStore = {
  
    "profileUser": {
        "id": 1,
        "avatar": <AvatarsIcon />,
        "fullName": "Thomas",
        "role": "Admin",
        "about": "",
        "status": "online",
        "settings": {
            "isTwoStepAuthVerificationEnabled": true,
            "isNotificationsOn": false
        }
    },
    "contacts": [
        {
            "id": 3,
            "fullName": "Charlene",
            "role": "Pagana Pizzaria",
            "avatarColor": "primary",
            "about": "",
            "status": "busy",
            "avatar": '/images/avatars/scarlett-johansson.png'
        },
    ],
    "chats": [
        {
            "id": 1,
            "userId": 3,
            "unseenMsgs": 0,
            "chat": messages
        },
    ],
    "activeUser": {
        "id": 3,
        "fullName": "Charlene",
        "role": "Pagana Pizzaria",
        "avatarColor": "primary",
        "about": "",
        "status": "busy",
        "avatar": '/images/avatars/scarlett-johansson.png'
    }
  }

  const { activeUser, profileUser, contacts } = chatStore  

  const handleToggle = () => {
    setOpenEmojiPicker(prevOpen => !prevOpen)
  }

  const handleClick = event => {
    setAnchorEl(prev => (prev ? null : event.currentTarget))
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Function to scroll to bottom when new message is sent
  const scrollToBottom = () => {
    if (scrollRef.current) {
      if (isBelowLgScreen) {
        // @ts-ignore
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      } else {
        // @ts-ignore
        scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
      }
    }
  }

  // Wrapper for the chat log to handle scrolling
  const ScrollWrapper = ({ children, isBelowLgScreen, scrollRef, className }) => {
    if (isBelowLgScreen) {
      return (
        <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}>
          {children}
        </div>
      )
    } else {
      return (
        <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }} className={className}>
          {children}
        </PerfectScrollbar>
      )
    }
  }  

  const activeUserChat = chatStore.chats.find(chat => chat.userId === chatStore.activeUser?.id)

  // Close user profile right drawer if backdrop is closed and user profile right drawer is open
  useEffect(() => {
    if (!backdropOpen && userProfileRightOpen) {
      setUserProfileRightOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen])

  const handleSendMsg = (event, msg) => {

    event.preventDefault()

    if (msg.trim() == '') {

      setMsg('')

      return
    }
    
    const indiceArrayNewMessage = messages.length;

    const data = {
      "content": msg,
      "indiceArrayNewMessage": indiceArrayNewMessage
    }

    const now = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });

    const dataUser = {
      'message': msg,
      'time': now,
      'senderId': 1,
      'msgStatus': {
        'isSent': true,
        'isDelivered': false,
        'isSeen': false,
      }
    }

    setMessages((prev) => [...prev, dataUser]);
    setMsg('')
    
    postMessages(data)
  }

  async function postMessages(dados) {

    try {
      const data = await apiPaganaPizzaria.post('/messages', dados, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {

        console.log('Resposta postMessages', response.data)

        if (!response.data.error) {

        }

        return response.data

      }).catch(error => {

        console.log('/messages', error)

        return error
      })

      return data

    } catch (error) {

      console.log('Erro postMessages', error)

      return error
    }
  }

  useEffect(() => {
    getMessages()
  }, [])

  useEffect(() => {
    console.log('messages', messages)

    scrollToBottom()

  }, [chatStore])

  const handleInputEndAdornment = () => {

    return (
      <div className='flex items-center gap-1'>
        {isBelowSmScreen ? (
          <>
            <IconButton
              id='option-menu'
              aria-haspopup='true'
              {...(open && { 'aria-expanded': true, 'aria-controls': 'share-menu' })}
              onClick={handleClick}
              ref={anchorRef}
            >
              <i className='ri-more-2-line text-textPrimary' />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem
                onClick={() => {
                  handleToggle()
                  handleClose()
                }}
              >
                <i className='ri-emotion-happy-line text-textPrimary' />
              </MenuItem>
            </Menu>
            <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value)

                if (messageInputRef.current) {
                  messageInputRef.current.focus()
                }
              }}
            />
          </>
        ) : (
          <>
            <IconButton ref={anchorRef} size='small' onClick={handleToggle}>
              <i className='ri-emotion-happy-line text-textPrimary' />
            </IconButton>
            <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value)

                if (messageInputRef.current) {
                  messageInputRef.current.focus()
                }
              }}
            />
          </>
        )}
        {isBelowSmScreen ? (
          <CustomIconButton 
            variant='contained' 
            color='primary' 
            type='submit' 
            sx={{
              borderRadius: '500px',
          }}>
            <i className='ri-send-plane-line' />
          </CustomIconButton>
        ) : (
          <Button
            variant='contained'
            color='primary'
            type='submit'
            endIcon={<i className='ri-send-plane-line' />}
            sx={{
              borderRadius: '500px',
            }}
          >
            Enviar
          </Button>
        )}
      </div>
    )
  }

  // Focus on message input when active user changes
  useEffect(() => {
    if (chatStore.activeUser?.id !== null && messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [chatStore.activeUser])

  // Close backdrop when sidebar is open on below md screen
  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowMdScreen])

  // Open backdrop when sidebar is open on below sm screen
  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowSmScreen])

  // Close sidebar when backdrop is closed on below md screen
  useEffect(() => {
    if (!backdropOpen && sidebarOpen) {
      setSidebarOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen])

  return (
    <div
      className={classNames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
        border: settings.skin === 'bordered',
        'shadow-md': settings.skin !== 'bordered'
      })}
    >

      {activeUser && (
        <div className='flex flex-col flex-grow bs-full'>
          <div className='flex items-center justify-between border-be plb-[17px] pli-5 bg-[var(--mui-palette-customColors-chatBg)]'>
            
            <UserAvatar
              activeUser={activeUser}
              setBackdropOpen={setBackdropOpen}
              setUserProfileLeftOpen={setUserProfileRightOpen}
            />
          </div>

          <ScrollWrapper
            isBelowLgScreen={isBelowLgScreen}
            scrollRef={scrollRef}
            className='bg-[var(--mui-palette-customColors-chatBg)]'
          >
            <CardContent className='p-0'>
              {activeUserChat &&
                formatedChatData(activeUserChat.chat, profileUser).map((msgGroup, index) => {
                  const isSender = msgGroup.senderId === profileUser.id
      
                  return (
                    <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
                      
                      {!isSender && (
                        <AvatarWithBadge
                          alt={activeUser?.fullName}
                          src={activeUser.avatar}
                        />
                      )}

                      {isSender && profileUser.avatar}

                      <div
                        className={classnames('flex flex-col gap-2', {
                          'items-end': isSender,
                          'max-is-[65%]': !isBelowMdScreen,
                          'max-is-[75%]': isBelowMdScreen && !isBelowSmScreen,
                          'max-is-[calc(100%-5.75rem)]': isBelowSmScreen
                        })}
                      >
                        {msgGroup.messages.map((msg, index) => (
                          <Typography
                            key={index}
                            className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs', {
                              'bg-backgroundPaper rounded-e-lg rounded-b-lg': !isSender,
                              'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s-lg rounded-b-lg': isSender
                            })}
                            style={{ wordBreak: 'break-word' }}
                          >
                            {msg.message}
                          </Typography>
                        ))}
                        {msgGroup.messages.map(
                          (msg, index) =>
                            index === msgGroup.messages.length - 1 &&
                            (isSender ? (
                              <div key={index} className='flex items-center gap-2'>
                                {msg.msgStatus?.isSeen ? (
                                  <i className='ri-check-double-line text-success text-base' />
                                ) : msg.msgStatus?.isDelivered ? (
                                  <i className='ri-check-double-line text-base' />
                                ) : (
                                  msg.msgStatus?.isSent && <i className='ri-check-line text-base' />
                                )}
                                {index === activeUserChat.chat.length - 1 ? (
                                  <Typography variant='caption'>
                                    {new Date().toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric', hour12: false })}
                                  </Typography>
                                ) : msg.time ? (
                                  <Typography variant='caption'>
                                    {new Date(msg.time).toLocaleString('pt-BR', {
                                      hour: 'numeric',
                                      minute: 'numeric',
                                      hour12: false
                                    })}
                                  </Typography>
                                ) : null}
                              </div>
                            ) : index === activeUserChat.chat.length - 1 ? (
                              <Typography key={index} variant='caption'>
                                {new Date().toLocaleString('pt-BR', { hour: 'numeric', minute: 'numeric', hour12: false })}
                              </Typography>
                            ) : msg.time ? (
                              <Typography key={index} variant='caption'>
                                {new Date(msg.time).toLocaleString('pt-BR', {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: false
                                })}
                              </Typography>
                            ) : null)
                        )}
                      </div>
                    </div>
                  )
                })}
            </CardContent>
          </ScrollWrapper>

          <form
            autoComplete='off'
            onSubmit={event => handleSendMsg(event, msg)}
            className=' bg-[var(--mui-palette-customColors-chatBg)]'
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder='Mensagem'
              value={msg}
              className='p-5'
              onChange={e => setMsg(e.target.value)}
              sx={{
                '& fieldset': { border: '0' },
                '& .MuiOutlinedInput-root': {
                  background: 'var(--mui-palette-background-paper)',
                  borderRadius: '500px',
                  boxShadow: 'var(--mui-customShadows-xs)'
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSendMsg(e, msg)
                }
              }}
              size='small'
              inputRef={messageInputRef}
              InputProps={{ endAdornment: handleInputEndAdornment() }}
            />
          </form>

        </div>
      )}
      
    </div>
  )
}

export default ChatWrapper
