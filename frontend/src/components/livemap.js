import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {MapContainer, TileLayer, Polyline, Marker, Popup} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useMap } from 'react-leaflet';


function LiveMap(props){
    const [mapState, setMapState] = useState(null)
    const [markerState, setMarkerState] = useState([])
    const [markerInfo, setMarkerInfo] = useState([])
    const [currentMap, setCurrentMap] = useState(null)
    const [stops, setVehiclesStops] = useState([])
    const [vehicles, setVehicles] = useState([])
    useEffect(()=>{
        
        if (props.m !== null){
            mapStops(props.m)
            console.log("yo--")
            console.log(props.m)
        }
        else{
            // if a favorite is not selected then don't display anything on the map
            setMapState(null)
            setCurrentMap(null)
            setMarkerInfo([])
            setMarkerState([])
            setVehicles([])
        }
        
    }, [props.m])

    function mapStops(fav){
        async function getStops(){
            console.log(fav)
          let direction_id = (fav.direction === "Outbound" || fav.direction === "West" || fav.direction === "South") ? 0: 1
          try{
            const result = await axios.get(`https://api-v3.mbta.com/stops?filter[route]=${fav.favoriteName}&filter[direction_id]=${direction_id}`,)
            console.log(result)
            const newL = result.data.data.map(item => [item.attributes.latitude, item.attributes.longitude])
            const sc = newL[0]
            const ec = newL.at(-1)
            const start = result.data.data[0]
            const end = result.data.data.at(-1)
            setMapState(newL)
            setCurrentMap(fav)
            setMarkerInfo([start, end])
            setMarkerState([sc, ec])
            setVehicles([])
          }catch(error){
            console.log(error)
          }
      
        }
        getStops()
      }
    function mapVehicles(fav){
        async function getVehicles(){
            let direction_id = (fav.direction === "Outbound" || fav.direction === "West" || fav.direction === "South") ? 0: 1
            try{
            const result = await axios.get(`https://api-v3.mbta.com/vehicles?include=stop&filter[route]=${fav.favoriteName}&filter[direction_id]=${direction_id}`,)
            
        
            // they should same order so they can be accessed by index when mapping
            if (result.data.data !== undefined && result.data.included !== undefined){
                setVehicles(result.data.data)
                setVehiclesStops(result.data.included)
            }
            console.log(result.data)
            console.log(result.data.included)
            }catch(error){
            console.log(error)
            }
        
        }
        getVehicles()
    }
    function getTime(time){
        const date = new Date(time)
        const hours = date.getHours()
        
        let minutes = date.getMinutes()
        if (minutes < 10){
          minutes = `0${minutes}`
        }
        return (`${hours}:${minutes}`)
      }
    function RecenterMap({markerState}){
    const map = useMap()
    useEffect(()=>{
        console.log(markerState)
        try{
        map.flyTo([markerState[0], markerState[1]], 12, {
            duration: 1.0,
            animate:true
        })
        }catch(error){
        console.log(error)
        }
    }, [markerState, map])
    }
    return (
    <div className="mapDiv"  >
     <MapContainer className="map" center={[42.5030595,-70.890669]} zoom={11}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'>
      
      </TileLayer>
      {mapState && markerState.length > 0 && markerInfo && ( 
        <>
          <Polyline color='black' weight={3} opacity={1} positions={mapState}></Polyline>

          <Marker position={markerState[0]} icon={L.icon({
            iconUrl: require("../images/marker-icon.png"),
            iconSize: [20, 30]
          })}>
            <Popup>
             Start - {markerInfo[0].attributes.address || markerInfo[0].attributes.at_street || markerInfo[0].attributes.on_street || markerInfo[0].attributes.name}
            </Popup>
          </Marker>
          <Marker position={markerState[1]} icon={L.icon({
            iconUrl: require("../images/end-marker.png"),
            iconSize: [30, 30]
          })}>
            <Popup>
              Dest. - {markerInfo[1].attributes.address || markerInfo[1].attributes.at_street || markerInfo[1].attributes.on_street || markerInfo[1].attributes.name}
            </Popup>
          </Marker>
          </>
        )}\
        {/* Pass in start coordinates*/}
        {markerState.length >0 && (<RecenterMap markerState={markerState[0]}/>)}
        {vehicles.length > 0 && stops.length> 0 && (
          vehicles.map((veh, index)=>(
            <Marker position={[veh.attributes.latitude, veh.attributes.longitude]} icon={L.icon({
              iconUrl: require("../images/MBTA.png"),
              iconSize: [40, 40]
            })}>
              <Popup>
                Stop - {(stops.length === vehicles.length ? stops[index]?.attributes?.name: stops[0]?.attributes?.name)}
                <br/>
                Last Updated - {(getTime(veh.attributes.updated_at))}
              </Popup>

            </Marker>
            
          ))
        )}
       </MapContainer>
       <br></br>
       <Button size="lg" style={{width: "100%"}} disabled={!mapState} onClick={() => mapVehicles(currentMap)}>Live</Button>
    </div>
    )
    return(<></>)
}
export default LiveMap;