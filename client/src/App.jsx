import './App.css';
import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

const socket = io();

function App() {
  const [message, setMessage] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState("");
  const [serverMessages, setServerMessages] = useState([]);
  const messageInput = useRef();
  const textContainer = useRef();

  const addMessage = ({ message, user_id, user }) => {
    let newArray = [...serverMessages];
    let comparedArray = newArray[newArray.length - 1];

    if (comparedArray?.user_id === user_id) {
      newArray[newArray.length - 1].messages.push(message)
    } else {
      newArray.push({
        messages: [message], user_id, user
      })
    }

    setTimeout(() => {
      textContainer.current.scrollTo(0, document.body.scrollHeight)
    })

    return newArray;
  }

  const handleSubmitUser = (e) => {
    e.preventDefault();
    if (!user) return alert('The field is empty!')

    setIsLogged(true);
    messageInput.current.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    socket.emit('message', {
      user,
      message
    });

    setServerMessages(addMessage({ user, message, user_id: socket.id }));
    setMessage("");
    messageInput.current.focus()
  }

  const receiveMessage = (message) => {
    setServerMessages(addMessage(message));
  }

  useEffect(() => {
    socket.on('message', receiveMessage)

    return function () {
      socket.off('message');
    }
  }, [serverMessages.length]);

  return (
    <div className="bg-gray-800 min-h-screen">
      <form onSubmit={handleSubmitUser} className={`z-50 w-screen h-screen top-0 left-0 flex items-center justify-center bg-gray-800 flex-col gap-4  ${isLogged ? "hidden" : "fixed"}`}>
        <h2 className='text-white text-xl md:text-3xl font-light'>Choose your username:</h2>
        <div className='flex gap-2 max-w-full'>
          <input type="text" className='p-4 md:p-4 md:px-6 md:text-xl bg-transparent rounded-md text-white border border-gray-500' placeholder='Type here' onChange={e => setUser(e.target.value)} disabled={isLogged} />
          <button className='p-4 bg-indigo-600 text-sm h-full rounded-md text-white hover:bg-indigo-500 transition-all duration-75'>Save</button>
        </div>
      </form>

      <div ref={textContainer} className='relative p-4 gap-2 bg-red h-[calc(100vh-64px)] flex-auto overflow-y-auto items-center justify-center container m-auto'>
        <div className='absolute top-0 left-0 right-0 bottom-0'>
          <div className='relative flex items-stretch p-4 text-container min-h-full'>
            <ul className='relative flex flex-col min-h-full max-h-full flex-1 items-end justify-end gap-3'>
              {
                serverMessages.map(actual => (
                  <li className={`min-h-[8px] table shrink-0 grow-0 relative w-3/4 max-w-screen-md rounded-md ${actual.user_id === socket.id ? "bg-indigo-500 self-end flex-initial" : "bg-gray-700 self-start"}`}>
                    <span className={`triangle absolute border-t-[15px] ${actual.user_id === socket.id ? "-right-3 border-t-indigo-500" : "-left-3 border-t-gray-700"}`}></span>
                    <div className='py-2 px-4 text-white'>
                      {actual.user_id !== socket.id && <h4 className='relative font-bold pb-2 text-indigo-400'>{actual.user}</h4>}
                      {actual.messages.map(actualMessage => (
                        <p className='relative'>{actualMessage}</p>
                      ))}
                    </div>
                  </li>
                ))
              }
              {
                !serverMessages.length && <div className='text-white text-2xl italic font-light w-full h-full flex flex-col gap-6 flex-1 items-center justify-center'>
                  <p>¡No hay mensajes! :(</p>
                  <p>Sé el primero :)</p>
                </div>
              }
            </ul>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="h-16 bg-gray-900 fixed bottom-0 w-full">
        <div className='container m-auto p-3 flex items-stretch h-full gap-2'>
          <input type="text" ref={messageInput} placeholder='Type here...' className='text-white flex-1 px-4 rounded-md bg-white bg-opacity-5 border border-gray-700 focus:outline-none focus:outline-gray-600 hover:border-indigo-400' value={message} onChange={e => setMessage(e.target.value)} disabled={!isLogged} />
          <button disabled={!message} className='text-indigo-400 font-serif font-bold text-xl border border-indigo-400 rounded-md px-2 hover:bg-indigo-400 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:text-indigo-400'>►</button>
        </div>
      </form>
    </div>
  );
}

export default App;
