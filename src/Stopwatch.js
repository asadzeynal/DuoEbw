import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css'
import { Button, Label, Form, Header, Grid, Container, List, Statistic, Sidebar, Menu, Confirm } from 'semantic-ui-react'

import LioWebRTC from 'liowebrtc';

class Stopwatch extends Component {

    componentDidMount = () => {
        if (localStorage.getItem('lastSessionTime') && localStorage.getItem('lastSessionTime') !== "0" && !this.state.lastSessionTimeChecked) {
            this.setState({
                open: true,
            })
        }
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            localStorage.setItem('lastSessionTime', this.state.timerTime);
            if (this.state.username)
                return ev.returnValue = 'Are you sure you want to close?';
        });
    }

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
                this.setState(state => {
                    let users = state.users.filter((user) => (user.username !== data.username));
                    users = [...users, { username: data.username, time: data.time, stamp: data.timestamp }];
                    return {
                        users: users,
                    }
                });
            }
        });
        this.saveUsername = this.saveUsername.bind(this);
    }
    state = {
        timerOn: false,
        timerStart: 0,
        timerTime: 0,
        peerTime: 0,
        username: '',
        users: [],
        lastSessionTimeChecked: false,
        open: false,
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
            this.webrtc.shout('myTime', { time: this.state.timerTime, username: this.state.username, timestamp: new Date() });
        }, 500);
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

    saveUsername = (e) => {
        this.setState({
            username: this.username.value,
        });
    }

    handleCancel = () => {
        this.setState({
            lastSessionTimeChecked: true,
            open: false,
        })
    }

    handleConfirm = () => {
        this.setState({
            lastSessionTimeChecked: true,
            open: false,
            timerTime: localStorage.getItem('lastSessionTime'),
        })
    }

    render() {
        const { timerTime, username, users, lastSessionTimeChecked } = this.state;
        const sortedUsers = [...users].sort((a, b) => {
            if (a.username > b.username)
                return 1;
            if (a.username < b.username)
                return -1;
            return 0
        })
        const listItems = sortedUsers.map((d) =>
            <List.Item key={d.username}>
                <Label size="large" color='blue' horizontal>{d.username}
                    <Label.Detail>
                        {("0" + Math.floor(d.time / 3600000)).slice(-2)} : {("0" + (Math.floor(d.time / 60000) % 60)).slice(-2)} : {("0" + (Math.floor(d.time / 1000) % 60)).slice(-2)}
                    </Label.Detail>
                </Label>
            </List.Item>);
        if (username === '') {
            return (
                <Container textAlign="center">
                    <Header as="h1">Duo Ebw</Header>
                    <Header as="h1">Hi! This app is a productivity tool designed to help users do Ebw in cooperation. Track your friend's Ebw stopwatch and make sure not to fall back too much. Have a nice Ebw!</Header>
                    <Grid columns='3' divided>
                        <Grid.Column></Grid.Column>
                        <Grid.Column>
                            <Form>
                                <Form.Field>
                                    <label>Please, type in your username</label>
                                    <input name="username" placeholder='username' ref={(c) => this.username = c} />
                                </Form.Field>
                                <Button onClick={this.saveUsername} secondary type="submit">Next</Button>
                            </Form>
                        </Grid.Column>
                        <Grid.Column></Grid.Column>
                    </Grid>
                </Container>
            )
        }

        let centiseconds = ("0" + (Math.floor(timerTime / 10) % 100)).slice(-2);
        let seconds = ("0" + (Math.floor(timerTime / 1000) % 60)).slice(-2);
        let minutes = ("0" + (Math.floor(timerTime / 60000) % 60)).slice(-2);
        let hours = ("0" + Math.floor(timerTime / 3600000)).slice(-2);

        return (
            <div className="Stopwatch">
                <Confirm
                    open={this.state.open}
                    content={`Your last session stopped on ${("0" + Math.floor(localStorage.getItem('lastSessionTime') / 3600000)).slice(-2)} :
                    ${("0" + (Math.floor(localStorage.getItem('lastSessionTime') / 60000) % 60)).slice(-2)} :
                    ${("0" + (Math.floor(localStorage.getItem('lastSessionTime') / 1000) % 60)).slice(-2)} (hh:mm:ss). 
                    Do you want to restore it or start over?`}
                    cancelButton='Start Over'
                    confirmButton='Restore'
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                />
                <Grid textAlign="center">
                    <Sidebar style={{ "background": "#000000", "opacity": "0.9", "width": "250px" }}
                        animation='push'
                        icon='labeled'
                        direction='left'
                        vertical
                        inverted
                        visible
                    >
                        <List>
                            {listItems}
                        </List>
                    </Sidebar>
                    <Grid.Row>
                        <Grid.Column width={6}>
                            <Header as="h1">Duo Ebw</Header>
                            <Statistic.Group widths='four' >
                                <Statistic>
                                    <Statistic.Value>{hours}</Statistic.Value>
                                    <Statistic.Label>Hours</Statistic.Label>
                                </Statistic>
                                <Statistic>
                                    <Statistic.Value>{minutes}</Statistic.Value>
                                    <Statistic.Label>Minutes</Statistic.Label>
                                </Statistic>
                                <Statistic>
                                    <Statistic.Value>{seconds}</Statistic.Value>
                                    <Statistic.Label>Seconds</Statistic.Label>
                                </Statistic>
                                <Statistic>
                                    <Statistic.Value>{centiseconds}</Statistic.Value>
                                    <Statistic.Label>Centiseconds</Statistic.Label>
                                </Statistic>
                            </Statistic.Group>
                        </Grid.Column>

                    </Grid.Row>
                    <Grid.Row>
                        {this.state.timerOn === false && this.state.timerTime === 0 && (
                            <Button primary onClick={this.startTimer}>Start</Button>
                        )}
                        {this.state.timerOn === true && (
                            <Button secondary onClick={this.stopTimer}>Stop</Button>
                        )}
                        {this.state.timerOn === false && this.state.timerTime > 0 && (
                            <Button primary onClick={this.startTimer}>Resume</Button>
                        )}
                        {this.state.timerOn === false && this.state.timerTime > 0 && (
                            <Button color='red' onClick={this.resetTimer}>Reset</Button>
                        )}
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}
export default Stopwatch; 