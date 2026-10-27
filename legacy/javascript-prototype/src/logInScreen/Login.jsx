import { useCallback, useEffect, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";
import { useSVGResize } from "../useSVGResize";
function Login(){
    const [username, setUsername]= useState();
    const [password,setPassword]= useState();

    //load the data from the database
    //algorithm serach Binary Search
    //check if the user in the database.
     const drawHeader= useCallback(() => {
        const width = window.innerWidth;
        const height = 250;
         // Clear old SVG
      document.querySelector("#headerSVG").innerHTML = "";
      // Create new SVG
        const header = SVG()
            .addTo("#headerSVG")
            .size(width, height);
        // Draw header
        header
        .text("CircuitEDU")
        .font({ size: 65, family: "Moonbright Demo" })
        .fill("#fcf1bc")
        .center(width / 2, 180);
         
      }, []); 
      useSVGResize(drawHeader);
    function handleSubmit(event){

    }
    return(
       <div className="login-container">
            <div id="headerSVG"></div>
            <form 
      className="login-form"
      onSubmit={e => {
        e.preventDefault();
      }}>
      <input 
      type="text"
      placeholder="Enter Username"
      value={username}
      onChange={(event)=> setUsername(event.target.value)}
      />
      <input
      type="password"
      placeholder="Enter Password"
      value={password}
      onChange={(event)=> setPassword(event.target.value)}
      />
      <button> Log In</button>
    </form>
      </div>
      
      
    
    );
}
export default Login;