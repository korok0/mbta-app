import React, { useEffect, useState } from "react";
import getUserInfo from '../utilities/decodeJwt';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import ReactNavbar from 'react-bootstrap/Navbar';


// Here, we display our Navbar
export default function Navbar() {
  // We are pulling in the user's info but not using it for now.
  // Warning disabled: 
  // eslint-disable-next-line
  const [user, setUser] = useState({})
    

  useEffect(() => {
  setUser(getUserInfo())
  }, [])
  // get username from user info to fill in href link param
  let username;
  if (user !== undefined){
    username = user.username
  }else{
    username = ""
  }
  // if (!user) return null   - for now, let's show the bar even not logged in.
  // we have an issue with getUserInfo() returning null after a few minutes
  // it seems.
  return (
    <div id="mt">
      <ReactNavbar bg="dark" variant="dark" id="ida">
      <Container >
        <Nav className="m-auto">
          <Nav.Link href="/">Start</Nav.Link>
          <Nav.Link href="/home">Home</Nav.Link>
          <Nav.Link href={user ? `/favorites/${user.username}`: "/users"}>Favorites</Nav.Link>
          <Nav.Link href={`/comments/${username}`}>Comments</Nav.Link>
          <Nav.Link href="/users">Users</Nav.Link>
          <Nav.Link href="/mbtaMyPage">My Page</Nav.Link>
          <Nav.Link href="/privateUserProfile">Profile</Nav.Link>
        </Nav>
      </Container>
    </ReactNavbar>
    </div>

  );
}