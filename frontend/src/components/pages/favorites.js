import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'
import Dropdown from "react-bootstrap/Dropdown"
import DropdownButton from "react-bootstrap/DropdownButton"
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Modal from "react-bootstrap/Modal"
import "leaflet/dist/leaflet.css"
import getUserInfo from '../../utilities/decodeJwt';
import "../styles/Favorites.css"
import Creatable from "react-select"
import LiveMap from '../livemap';

function Favorites() {
  const [favs, setFav] = useState([]);
  const {username} = useParams();
  const [searchFavorite, setSearchFavorite] = useState('')
  const [show, setShow] = useState(false);
  const [selectedFavorite, setSelectedFav] = useState(null)
  const [mapFav, setMapFav] = useState(null)
  const [showDirMenu, setShowDirMenu] = useState(false)
  const loggedUser = getUserInfo()
  // Marker State [start, end] - 0 and 1
  const [addFav, setAddFav] = useState('')
  // not a favorite but a list of directions in a route found using the favoriteName
  const [modalFavDir, setModalFavDir] = useState([])
  const [fInfo, fInfoSet] = useState(false)
  const [modalSubmitDisabled, setModalSubmit] = useState(true)
  const [lineID, setLine] = useState({})
  const [pageLoaded, setPageLoaded] = useState(false)
  
  const [viewingSelf, setViewingSelf] = useState(false)
  const url = `${process.env.REACT_APP_BACKEND_SERVER_URI}`
  const [routes, setRoutes] = useState([])
  const [addButton, setAddButton] = useState(false)

  useEffect(()=>{
    async function getRoutes(){
      try{
        const result = await axios.get("https://api-v3.mbta.com/routes")
        setRoutes(result.data.data.map(route=>(
            {value: route.id, label: `${route.attributes.long_name} | ${route.id}`, directions: route?.attributes.direction_names.map(dir=>({value: dir, label: dir}))}
        )))
      }
      catch(error){
        console.log(error)
      }
    }
      getRoutes()
  }, [])

  useEffect(() => {
    document.title = "Favorites Page"
    document.icon = "../../images/marker-icon.png"
    async function fetchData() {
      const result = await axios.get(
        `${url}/favorites/${username}`,
      );
      setFav(result.data);
    }
    fetchData();
    if (loggedUser !== undefined){
      if (loggedUser.username === username)
      setViewingSelf(true)
    }
    
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [username]);

useEffect(() => {
  
  // this function maps objects of {id: route objects} so that a favid (favoriteName) can act as a key between different databases and easily access information
  async function mapFavInfo(){
    const favIds = favs.map(fav =>fav.favoriteName)
    const routes = await getFavRouteInfo(favIds.join(','))
    if (routes === null) return
    // order the result of the routes to match order of favIds
    const orderedData = favIds.map(id => routes.find(route => parseInt(route.id) === id || route.id === id))
    const updatedState = {} 

    favIds.forEach((id, index) => updatedState[id] = orderedData[index])


    fInfoSet(updatedState)
  }
  
  if (favs.length > 0){
    mapFavInfo()
  }else {
    console.log("0")
  }
  setPageLoaded(true)

}, [favs])
useEffect(()=>{
  async function lines(){
    for (const fav of favs){
        const lineid = fInfo[fav.favoriteName]?.relationships?.line?.data?.id
        //const lineid = 'line-Red'
        const line = await getLineName(lineid)
        if (line !== null){
          setLine(oldState=>({...oldState, [fav.favoriteName]: line}))
        }
    }
  }
  
    lines()
  
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [fInfo])
async function getLineName(id){
  
    if (id!== undefined){
      try{
        const result = await axios.get(`https://api-v3.mbta.com/lines/${id}`)
        return (result.data.data.attributes.long_name)
      }catch(error){
        console.log(error)
        return (null)
      }
    }
  
}
async function getFavRouteInfo(id) {
    
      try{
        const result = await axios.get(`https://api-v3.mbta.com/routes?filter[id]=${id}`,)
        const routeInfo = result.data.data
       
        return (routeInfo)}
      catch(error){
        console.log(error)
        return(null)
      }

}
const handleClose = () => {
  setShow(false);
}
// set modal information
const handleShow = (fav) => {
  
  setSelectedFav(fav)
  
  async function getDirections(){
    let exists = true

    try{
      const result = await axios.get(`https://api-v3.mbta.com/routes/${fav.favoriteName}`,)
      const route = result.data.data
      console.log(result.data)
      setModalFavDir(route.attributes.direction_names)
    }
    catch(error){
      exists = false
      console.log(error)
    }
    // if route exists then show modal
    if (exists){
      setShow(true)
    }
  }
    getDirections()
    
};
function deleteButtonClick(fav){
  
  async function deleteData() {
    try{
      
    const result = await axios.delete(
      `${url}/favorites/deleteFavorite`, {data: {username: fav.username, favoriteName: fav.favoriteName}}
    );
    // update favorites
    setSearchFavorite('')
    setFav(result.data);
    }
    catch(error){
      console.log(error)
    }

  }
  deleteData()
  setMapFav(null)
}
async function specificFavorite() {
  // searchFavorite is '' - so if nothing is entered then route will simply return all favorites
  try{
  const result = await axios.get(
    `${url}/favorites/${username}/${searchFavorite}`,
  );
  // update favorites
  setFav(result.data);
  }
  catch (error){
    console.log(error)
  }
  
}
function searchHandler(e){
  e.preventDefault()
  
  specificFavorite()
}

function modalSubmit(e){
  e.preventDefault()
  handleClose()
  let formData = new FormData(e.target)
  let formDataObj = Object.fromEntries(formData.entries())
  async function editFavorite(){
    
    try{
      const result = await axios.patch(`${url}/favorites/editFavorite`,
    {username: username, favoriteName: formDataObj.favorite, 
      direction: formDataObj.direction})
      // if a favorite is displayed after filter then continue to show that favorite
      if (searchFavorite.length > 0){
        specificFavorite()
      }
      else{
        setFav(result.data)
      }
    }catch(error){
      console.log(error)
    }
      
  }
  editFavorite()
  setMapFav(null)
}
const modalSubmitChange = (e)=>{
  if (e.target.value !== 'default'){
    setModalSubmit(false)
  }else{
    setModalSubmit(true)
  }
}


function addForm(e){
  e.preventDefault()
  let formData = new FormData(e.target)
  
  let route = Object.fromEntries(formData.entries())
  console.log(route.routeID)
  console.log(route.direction)
  console.log("hey")
  async function addFavorite(){
    console.log(username)
    console.log(route.routeID)
    console.log(route.direction)
    try{

    
    const result = await axios.post(`${url}/favorites/create`, {username: username, favoriteName: route.routeID, direction: route.direction})
    setFav([...favs, result.data])
    }
    catch(error){
      console.log("error")
    }
  }
  addFavorite()
  
  // close directions select menu
  handleCloseDir()
  setAddButton(false)
  setAddFav(null)
  
}

const handleShowDir = () => setShowDirMenu(true)
const handleCloseDir = (e) => 
  setShowDirMenu(false)
  
function creatableChange(e){
  setAddFav(e)
  handleShowDir()
}
const enableAddButton = ()=> setAddButton(true)

return (
  <div className="main">
    {viewingSelf && (<Form onSubmit={addForm}>
    <Creatable onChange={(e)=>creatableChange(e)} name="routeID" value={addFav} isClearable id="creatable" options={routes} placeholder="Add Route"/>
    
    {showDirMenu && (<Creatable isClearable onChange={enableAddButton} name="direction" id="creatable" options={addFav?.directions} placeholder="Add Direction" />)}
    <Button type='submit' disabled={!addButton}>Add</Button>
    </Form>)}
  <div className ="cardColumn">
    
    {pageLoaded && (
      <>
    <Card
    body
    key={
      'searchBarCard'
    }
    className='searchContainer'
    >
    <Card.Body>
      <Card.Text>
        <Form className="searchBar" onSubmit={searchHandler}>
          <Form.Group >
            <Form.Control type='search' placeholder='favorite' value={searchFavorite} 
          onChange={(e)=> setSearchFavorite(e.target.value)}></Form.Control>
          </Form.Group>
          <Button type='submit'>Submit</Button>
        </Form>
      </Card.Text>
    </Card.Body>
    </Card> 
    <div className='fav'>
    {/*Load cards only once fInfo has loaded*/}
    
    {Object.keys(fInfo).length > 0 && (
      favs.map((fav) => (
        <Card
        body
        color="success"
        
        className='favCard'
        key={fav.favoriteName}
        
        
      >
        <Card.Body>
        <Card.Title>
          Route - {fav.favoriteName}<br/>
          Line - {lineID[fav.favoriteName]}
        </Card.Title>
        <Card.Text>
        
        {fInfo && (fInfo[fav.favoriteName]?.attributes.long_name)}<br/> 
      
            Direction - {fav.direction} <br/>
          <ButtonGroup >
          <Button onClick={() => setMapFav(fav)}>map2</Button>
          {viewingSelf && (
          <DropdownButton className="drop" as={ButtonGroup} title="manage" id="bg-nested-dropdown">
            <Dropdown.Item onClick={() => handleShow(fav)}>
            Edit
            </Dropdown.Item>
            <Dropdown.Item onClick={() => deleteButtonClick(fav)}>
              Delete
            </Dropdown.Item>
        </DropdownButton>
        
        )}
        </ButtonGroup></Card.Text>
  
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Favorite</Modal.Title>
            </Modal.Header>
            <Modal.Footer
            style={{justifyContent: 'center', display:'block'}}>
              <Form onSubmit={modalSubmit}>
                <Form.Label>Route</Form.Label>
                <Form.Label></Form.Label>
                <Form.Control type='text' name='favorite' value={selectedFavorite?.favoriteName} readOnly placeholder={searchFavorite?.favoriteName}></Form.Control>
                <Form.Label>Direction</Form.Label>
                <Form.Select defaultValue={'default'} name='direction' onChange={modalSubmitChange}>
                  
                <option value='default' disabled selected>Direction</option>
                  {modalFavDir.map(direction =>(
                    <option value={direction}>{direction}</option>
                  ))}
      
                </Form.Select>
                <br/>
                <div className="d-grid gap-2">
                <Button size="lg" type='submit' id='submitButton' disabled={modalSubmitDisabled}>Submit</Button>
              </div>
              </Form>
            </Modal.Footer>
          
        </Modal>
        </Card.Body>
      </Card>
      )))
    }
    </div>
  </>)}
  </div>
  <div className="mapDiv"  >
  <LiveMap m={mapFav}/>
  </div>
    </div>
    );
}
export default Favorites;