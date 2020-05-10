import React, { Component } from "react";
import "./App.css";
import LioWebRTC from 'liowebrtc';

class Stopwatch extends Component {

    webrtc = new LioWebRTC({
        dataOnly: true, 
    });
    constructor(props) {
        super(props);
        this.webrtc.on('ready', () => {
            this.webrtc.joinRoom('duoebw');
        });
        this.webrtc.on('receivedPeerData', (type, data, peer) => {
            if (type === 'myTime') {
                this.setState({
                    peerTime: data.time,
                });
            }
        });
    }
    state = {
        timerOn: false,
        timerStart: 0,
        timerTime: 0,
        peerTime: 0,
    }

    startTimer = () => {
        this.setState({
            timerOn: true,
            timerTime: this.state.timerTime,
            timerStart: Date.now() - this.state.timerTime
        });
        this.timer = setInterval(() => {
            this.setState({
                timerTime: Date.now() - this.state.timerStart
            });
        }, 10);
        this.sender = setInterval(() => {
            this.webrtc.shout('myTime', { time: this.state.timerTime });
        }, 100);
    };
    stopTimer = () => {
        this.setState({ timerOn: false });
        clearInterval(this.timer);
    };
    resetTimer = () => {
        this.setState({
            timerStart: 0,
            timerTime: 0
        });
        clearInterval(this.sender);
    };

    render() {
        const { timerTime } = this.state;
        let centiseconds = ("0" + (Math.floor(timerTime / 10) % 100)).slice(-2);
        let seconds = ("0" + (Math.floor(timerTime / 1000) % 60)).slice(-2);
        let minutes = ("0" + (Math.floor(timerTime / 60000) % 60)).slice(-2);
        let hours = ("0" + Math.floor(timerTime / 3600000)).slice(-2);


        const { peerTime } = this.state;
        let peerCentiseconds = ("0" + (Math.floor(peerTime / 10) % 100)).slice(-2);
        let peerSeconds = ("0" + (Math.floor(peerTime / 1000) % 60)).slice(-2);
        let peerMinutes = ("0" + (Math.floor(peerTime / 60000) % 60)).slice(-2);
        let peerHours = ("0" + Math.floor(peerTime / 3600000)).slice(-2);


        return (
            <div className="Stopwatch">
                <div className="Stopwatch-header">Stopwatch</div>
                <div className="Stopwatch-display">
                    {hours} : {minutes} : {seconds} : {centiseconds}
                </div>
                {this.state.timerOn === false && this.state.timerTime === 0 && (
                    <button onClick={this.startTimer}>Start</button>
                )}
                {this.state.timerOn === true && (
                    <button onClick={this.stopTimer}>Stop</button>
                )}
                {this.state.timerOn === false && this.state.timerTime > 0 && (
                    <button onClick={this.startTimer}>Resume</button>
                )}
                {this.state.timerOn === false && this.state.timerTime > 0 && (
                    <button onClick={this.resetTimer}>Reset</button>
                )}
                <div className="peerTime">
                    {peerHours} : {peerMinutes} : {peerSeconds} : {peerCentiseconds}
                </div>
            </div>
        );
    }
}
export default Stopwatch;