import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'
import axios from 'axios';
function UsersMenu(){
    const [users, setUsers] = useState([])
    const url = `${process.env.REACT_APP_BACKEND_SERVER_URI}`
    useEffect(()=>{
        async function getUsers(){
            const result = await axios.get(`${url}/user/getAll`)
            setUsers(result.data)
        }
        getUsers()
    }, [])
    return (
        <>
        <div style={{display: "block"}}>
        {users.map(user=>(
            <Card style={{display: "flex", }}>
            <Card.Body>
                <Card.Text style={{display: "flex"}}>
                    <div style={{width: "fit-content"}}>{user.username}</div> <div style={{width: "fit-content", "marginLeft": "20px"}}><Button onClick={()=>{window.location.href = `/favorites/${user.username}`}}>View</Button></div>
                </Card.Text>
            </Card.Body>
        </Card>
        ))}
        </div>
        </>
    )
}
export default UsersMenu