import { useCallback, useState } from 'react'
import './App.css'

import * as openmls from "openmls-wasm"

function App() {
  const [client, setClient] = useState()
  const [groupName, setGroupName] = useState("")

  const register = async () => {
    const client = await openmls.register("name")
    setClient(client)
  }

  const update = async () => {
    if(!client) return

    await openmls.update(client, "hello")
  }

  const create_kp = async () => {
    if(!client) return
    const newClient = await openmls.create_kp(client)
    setClient(newClient)
  }

  const create_group = useCallback(async () => {
    if(!client) return
    if(!groupName) return
    const newClient = await openmls.create_group(client, groupName)
    setClient(newClient)
    setGroupName("")
  }, [client, groupName])

  return (
    <>
      <div className="flex-column">
        {client && JSON.stringify(client)}
        <button onClick={register}>Register</button>
        <button onClick={update}>Update</button>
        <button onClick={create_kp}>Create KP</button>
        <button onClick={create_group}>Create Group</button>
        <input placeholder='group name' type="text" onChange={(e) => {
          e.preventDefault()
          setGroupName(e.target.value)
        }}/>
      </div>
    </>
  )
}

export default App
