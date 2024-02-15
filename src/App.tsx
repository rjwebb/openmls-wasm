import { useCallback, useState } from "react";
import "./App.css";

import * as openmls from "openmls-wasm";
import { Map as ImmutableMap } from "immutable";

type Contact = unknown;
type ContactMap = ImmutableMap<Uint8Array, Contact>;

type Group = unknown;
type GroupMap = ImmutableMap<Uint8Array, Group>;

type SignatureKeyPair = {
  private: Uint8Array;
  public: Uint8Array;
  signature_scheme: unknown;
};

type CredentialWithKey = {
  credential: unknown;
  signature_key: unknown;
};

type Kp = ImmutableMap<Uint8Array, unknown>;
type Identity = {
  kp: Kp;
  credential_with_key: CredentialWithKey | null;
  signer: SignatureKeyPair | null;
};

type Client = {
  username: string;
  contacts: ContactMap;
  groups: GroupMap;
  identity: Identity;
};

function App() {
  // user state
  const [client, setClient] = useState<Client>({
    username: "",
    contacts: ImmutableMap(),
    groups: ImmutableMap(),
    identity: {
      kp: ImmutableMap(),
      credential_with_key: null,
      signer: null,
    },
  });

  // form data
  const [clientName, setClientName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [remClientName, setRemClientName] = useState("");

  const register = useCallback(async () => {
    if (!clientName) {
      console.log("no client name");
      return;
    }

    // construct an empty client
    const client = await openmls.create_client(clientName);

    // add some key packages
    const kp1 = await openmls.create_kp(client);
    const kp1Hash = await openmls.hash_kp(kp1);

    const kp2 = await openmls.create_kp(client);
    const kp2Hash = await openmls.hash_kp(kp2);

    // broadcast the client
    await openmls.register(client);

    setClient((oldClient) => {
      return {
        username: client.username,
        contacts: client.contacts,
        groups: client.groups,
        identity: {
          credential_with_key: client.identity.credential_with_key,
          signer: client.identity.signer,
          kp: oldClient.identity.kp.set(kp1Hash, kp1).set(kp2Hash, kp2),
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientName]);

  const update = useCallback(async () => {
    await openmls.update(client, groupName);
  }, [client, groupName]);

  const create_kp = useCallback(async () => {
    const value = await openmls.create_kp(client);
    const key = await openmls.hash_kp(value);

    await openmls.broadcast_kp(client, key, value);

    setClient((oldClient) => {
      return {
        ...oldClient,
        identity: {
          ...oldClient.identity,
          kp: oldClient.identity.kp.set(key, value),
        },
      };
    });
  }, [client]);

  const create_group = useCallback(async () => {
    if (!groupName) {
      console.log("no group name");
      return;
    }
    const newClient = await openmls.create_group(client, groupName);
    setClient((oldClient) => ({ ...oldClient, groups: newClient.groups }));
    setGroupName("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, groupName]);

  const send_msg = useCallback(async () => {
    if (!groupName) {
      console.log("no group name");
      return;
    }
    await openmls.send_msg(client, message, groupName);
    setMessage("");
    setGroupName("");
  }, [client, message, groupName]);

  const invite_client = useCallback(async () => {
    if (!groupName) {
      console.log("no group name");
      return;
    }
    const newClient = await openmls.invite_client(
      client,
      newClientName,
      groupName
    );
    setClient(newClient);
    setGroupName("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, newClientName, groupName]);

  const remove_client = useCallback(async () => {
    if (!groupName) {
      console.log("no group name");
      return;
    }
    const newClient = await openmls.remove_client(
      client,
      remClientName,
      groupName
    );
    setClient(newClient);
    setGroupName("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, remClientName, groupName]);

  const read_msgs = useCallback(async () => {
    if (!groupName) {
      console.log("no group name");
      return;
    }
    const messages = await openmls.read_msgs(client, groupName);
    console.log(messages);
  }, [client, groupName]);

  const reset_server = async () => {
    await openmls.reset();
  };

  return (
    <>
      {client && JSON.stringify(client)}
      <br />
      <div className="flex-column container">
        <button onClick={register}>Register</button>
        <input
          placeholder="client name"
          type="text"
          onChange={(e) => {
            e.preventDefault();
            setClientName(e.target.value);
          }}
        />
        <br />

        <div className="flex-row flex-gap-2">
          <button onClick={update}>Update</button>
          <button onClick={create_kp}>Create KP</button>
        </div>
        <br />
        <button onClick={create_group}>Create Group</button>
        <input
          placeholder="group name"
          type="text"
          onChange={(e) => {
            e.preventDefault();
            setGroupName(e.target.value);
          }}
        />
        <br />
        <button onClick={send_msg}>Send Message</button>
        <input
          placeholder="message"
          type="text"
          onChange={(e) => {
            e.preventDefault();
            setMessage(e.target.value);
          }}
        />
        <br />
        <button onClick={invite_client}>Invite Client</button>
        <input
          placeholder="new client name"
          type="text"
          onChange={(e) => {
            e.preventDefault();
            setNewClientName(e.target.value);
          }}
        />
        <br />
        <button onClick={remove_client}>Remove Client</button>
        <input
          placeholder="remove client"
          type="text"
          onChange={(e) => {
            e.preventDefault();
            setRemClientName(e.target.value);
          }}
        />
        <br />
        <button onClick={read_msgs}>Read Messages</button>
        <button onClick={reset_server}>Reset Server</button>
      </div>
    </>
  );
}

export default App;
