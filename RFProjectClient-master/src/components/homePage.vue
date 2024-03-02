<template>
  <form v-show="driverDetailForm" id="form" @submit.prevent="submitForm">
    <h1>Start Driving</h1>
    <div class="d-flex flex-row justify-content-center align-items-center m-2">
      <label for="driver-name">Name</label>
      <input class="form-control input-box" type="text" id="driver-name" name="name-input" v-model="driverName" placeholder="driver name" required>
    </div>
    <div class="d-flex flex-row justify-content-center align-items-center m-2">
      <label for="x">X:</label>
      <input  class="form-control input_cod" type="number" id="x" name="X-coordinate" v-model="X" required>
      <label for="y">Y:</label>
      <input  class="form-control input_cod" type="number" id="y" name="Y-coordinate" v-model="Y" required>
    </div>
    <div class="d-flex flex-row justify-content-center align-items-center m-2">
      <label for="Angle-input">Angle</label>
      <input  class="form-control input-box" type="number" id="Angle-input" name="Angle-input" v-model="Angle" placeholder="degree" required>
    </div>
    <div class="d-flex flex-row justify-content-center align-items-center m-2">
      <label for="speed-input">Speed</label>
      <input  class="form-control input-box" type="number" id="speed-input" name="speed-input" v-model="Speed" placeholder="km/h" required>
    </div>
    <button class="btn btn-primary" type="submit" id="room-button" @click="clickJoin">Drive</button>
  </form>
  <!-- make table of driver id, driver name, drive x, driver y,driver angle driver speed, -->
  <div v-show="tableShow">
    <h2>My Car</h2>
    <div  class="d-flex flex-row justify-content-around align-items-center flex-wrap" style="width: 100%;">
      <h5 class="m-2">{{ driverName }}</h5>
      <h5 v-if="tableShow" class="m-2">X: {{ X.toFixed(2) }}</h5>
      <h5 v-if="tableShow" class="m-2">Y: {{ Y.toFixed(2) }}</h5>
      <div class="d-flex flex-row justify-content-center align-items-center m-2">
        <label for="Angle-input">Angle</label>
        <input  class="form-control input-box" type="text" id="Angle-input" name="Angle-input" v-model="Angle" placeholder="degree" required>
      </div>
      <div class="d-flex flex-row justify-content-center align-items-center m-2">
        <label for="speed-input">Speed</label>
        <input  class="form-control input-box" type="text" id="speed-input" name="speed-input" v-model="Speed" placeholder="km/h" required>
      </div>
      <button class="btn btn-primary m-2" type="submit" id="room-button" @click="startDriving">Update</button>
    </div>
  </div>
  <hr v-show="tableShow">
  <div v-show="tableShow">
    <div class="row">
      <div  class="m-3 col d-flex flex-column justify-content-center align-items-center">
        <h4>Other Driver List</h4>
        <table class="table table-striped" id="driver-table">
        </table>
      </div>
      <div class="col m-3 messageBox" id="messageBox">
        <h4>Messages</h4>
      </div>
    </div>
  </div>
</template>

<script>

import { io} from "socket.io-client" 
import car_start_sound from "../assets/carStart.mp3"
import received_message_sound from "../assets/receivedMessage.mp3"

export default {
  name: 'HomePage',

  data(){
    return {
      driverDetailForm: true,
      tableShow: false,
      socket: null,
      driverName: null,
      X: 0,
      Y: 0,
      Angle: 0,
      Speed: 10,
      driverList: [],
      overtake:false,
      overtakingInterval:null,
      carUpdatingInterval:null,
    }
  },
  methods:{
    clickJoin(){
      console.log("Joining room")
    },
    submitForm(){
      // start audio
      const audio = new Audio(car_start_sound)
      audio.play()
      console.log("Submitting form", this.driverName, this.X, this.Y, this.Angle, this.Speed)
      this.socket.emit("send-client-detail" , this.driverName,this.X,this.Y,this.Angle,this.Speed)
      this.startDriving();
      this.driverDetailForm = false
      this.tableShow = true
    },
    sendMessage(msg){
      const messageBox = document.getElementById("messageBox")
      const message = document.createElement("p")
      message.className = "sendMessage"
      message.style.textAlign = "right"
      message.innerText = msg
      messageBox.appendChild(message)
    },
    receieveMessage(msg){
      const audio = new Audio(received_message_sound)
      audio.play()
      const messageBox = document.getElementById("messageBox")
      const message = document.createElement("p")
      message.className = "receieveMessage"
      message.style.textAlign = "left"
      message.innerText = msg
      messageBox.appendChild(message)
    },
    startDriving(){
      if(this.carUpdatingInterval){
        clearInterval(this.carUpdatingInterval)
      }
      if(this.overtakingInterval){
        clearInterval(this.overtakingInterval)
      }
      this.carUpdatingInterval = setInterval(() => {
        this.X += (this.Speed / 3.6 * Math.cos(this.Angle * Math.PI / 180));
        this.Y += (this.Speed / 3.6 * Math.sin(this.Angle * Math.PI / 180));
        this.X = parseFloat(this.X.toFixed(2))
        this.Y = parseFloat(this.Y.toFixed(2))
        this.socket.emit("send-client-detail-update" ,this.X,this.Y,this.Angle,this.Speed)
      }, 1000);
      this.overtakingInterval =setInterval(() => {
        if(!this.overtake){
          for(let i=0;i<this.driverList.length;i++){
            if(this.driverList[i].id!=this.socket.id){
              let distance = Math.sqrt(Math.pow(this.X - this.driverList[i].x, 2) + Math.pow(this.Y - this.driverList[i].y, 2))
              let speedInMeter = this.Speed / 3.6
              let angle = Math.abs(this.Angle - this.driverList[i].angle)
              if(distance <= speedInMeter && angle <= 10 && speedInMeter> this.driverList[i].speed / 3.6){
                // send signal for overtaking
                console.log("overtaking")
                this.sendMessage("I'm overtaking "+this.driverList[i].name + " Please slow down")
                let sendMsg =this.driverName + " is overtaking you. Please slow down";
                this.socket.emit("send-message",1,this.driverList[i].id,sendMsg)
                this.overtake = true
                this.Angle-=5
                let originalSpeed = this.Speed
                this.Speed = Math.min(this.driverList[i].speed * 1.3,this.Speed)
                setTimeout(() => {
                  this.Angle+=5
                }, 2000);
                var intrval = setInterval(() => {
                  distance = Math.sqrt(Math.pow(this.X - this.driverList[i].x, 2) + Math.pow(this.Y - this.driverList[i].y, 2))
                  if(distance>2*speedInMeter){
                    this.overtake = false
                    this.Speed = originalSpeed
                    // send signal overtaking done
                    console.log("overtaking done")
                    this.sendMessage("I have overtaken "+this.driverList[i].name + ". Thank you for your cooperation")
                    sendMsg = this.driverName + " has overtaken you";
                    this.socket.emit("send-message",2,this.driverList[i].id,sendMsg)
                    sendMsg = "Thank you for your cooperation";
                    this.socket.emit("send-message",4,this.driverList[i].id,sendMsg)
                    sendMsg = "You can drive normally now";
                    this.socket.emit("send-message",3,this.driverList[i].id,sendMsg)
                    clearInterval(intrval)
                  }
                }, 1000);
              }
            } 
          }
        }
      }, 1000);
    },
    displayTable(driver,index){
      const driverTable = document.getElementById("driver-table")
      const row = driverTable.insertRow(-1)
      const no = row.insertCell(0)
      const nameCell = row.insertCell(1)
      const xCell = row.insertCell(2)
      const yCell = row.insertCell(3)
      const angleCell = row.insertCell(4)
      const speedCell = row.insertCell(5)
      no.innerHTML = index + 1
      nameCell.innerHTML = driver.name
      xCell.innerHTML = driver.x
      yCell.innerHTML = driver.y
      angleCell.innerHTML = driver.angle
      speedCell.innerHTML = driver.speed
    }
  },
  mounted(){
    // this.socket = io("http://localhost:3000")
    this.socket = io("https://rfproject.onrender.com")
    this.socket.on("connect", () => {
      console.log("Connected to server ", this.socket.id)
    })
    // this.socket.on("receive-name", (name) => {
    //   console.log("Received name ", name)
    //   this.displayName(name)
    // })
    this.socket.on("all_driver", (driver_list)=>{
      this.driverList = driver_list
      const driverTable = document.getElementById("driver-table")
      driverTable.innerHTML = ""
      const head = driverTable.createTHead()
      const row = head.insertRow(0)
      const idCell = row.insertCell(0)
      const nameCell = row.insertCell(1)
      const xCell = row.insertCell(2)
      const yCell = row.insertCell(3)
      const angleCell = row.insertCell(4)
      const speedCell = row.insertCell(5)
      idCell.innerHTML = "ID"
      nameCell.innerHTML = "Name"
      xCell.innerHTML = "X"
      yCell.innerHTML = "Y"
      angleCell.innerHTML = "Angle(deg)"
      speedCell.innerHTML = "Speed(km/h)"
      driver_list.forEach((driver)=>{
        if(driver.id!=this.socket.id){
          this.displayTable(driver,driver_list.indexOf(driver))
        }
      })
    })
    this.socket.on("receive-message", (code,msg,driver_id)=>{
      this.receieveMessage(msg)
      if(code==1){
        setTimeout(() => {
          this.sendMessage("Yes I have slowed down my speed from " + this.Speed+" Km/h" + " to " + 3*(this.Speed/4)+" Km/h")
          this.sendMessage("You can overtake now") 
          let sendMsg = this.driverName + " has slowed down speed from " + this.Speed+" Km/h"+ " to " +3*(this.Speed/4)+" Km/h"
          this.Speed = 3*(this.Speed/4)
          setTimeout(() => {
            this.socket.emit("send-message",4,driver_id,sendMsg)
            sendMsg = "You can overtake now"
            this.socket.emit("send-message",4,driver_id,sendMsg)
          }, 300);
        }, 1000);
      }
      if(code==3){
        setTimeout(() => {
          this.Speed = 4*(this.Speed/3)
          this.sendMessage("I'm again driving at my normal speed of " + this.Speed+" Km/h")
        }, 1000);
      }
    })
    
    // if (navigator.geolocation){
    //   const options = {
    //     enableHighAccuracy: true,
    //     timeout: 5000, // Increase timeout to 5 seconds
    //     maximumAge: 0
    //   };
    //   this.watchID = navigator.geolocation.watchPosition(position => {
    //     this.Y = position.coords.latitude;
    //     this.X = position.coords.longitude;
    //   },error => console.error(error), options);
    // } 
    // else {
    //   // Geolocation is not supported by the browser
      // console.log('Geolocation is not supported by this browser.');
    // }
  }
}
</script>

<style>
  .input-box{
    margin: 10px;
    width: 300px;
  }

  .input_cod{
    margin: 10px;
    width: 150px;
  }
  .messageBox{
    height: 500px;
    width: 48vw;
    border: 1px solid gray;
    overflow-y: scroll;
  }

  .sendMessage{
      /* dark glass morphism design */
      color: white;
      background: rgba(7, 22, 150, 0.704);
      box-shadow: 0 8px 32px 0 rgba( 31, 38, 135, 0.37 );
      backdrop-filter: blur( 4px );
      -webkit-backdrop-filter: blur( 4px );
      border-radius: 10px;
      border: 1px solid rgba( 255, 255, 255, 0.18 );
      padding: 10px;
      margin: 10px;
      width: 300px;
      margin-left: auto;
  }
  .receieveMessage{
    background: rgba( 255, 255, 255, 0.25 );
    box-shadow: 0 8px 32px 0 rgba( 31, 38, 135, 0.37 );
    backdrop-filter: blur( 4px );
    -webkit-backdrop-filter: blur( 4px );
    border-radius: 10px;
    border: 1px solid rgba( 255, 255, 255, 0.18 );
    padding: 10px;
    margin: 10px;
    width: 300px;
  }

  /* media query for input box */
  @media only screen and (max-width: 800px) {
    .input-box{
      width: 100%;
    }
    .input_cod{
      width: 100%;
    }
    .messageBox{
      width: 100%;
    }
    .sendMessage{
      width: 100%;
    }
    .receieveMessage{
      width: 100%;
    }
  }
</style>
