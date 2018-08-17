import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Container, Button, Progress } from 'semantic-ui-react'

const API_KEY = "606aaffd7ca10f0b80804a1f0674e4e1";

class App extends Component {

  state = {
    movieStart: false,
    movieFinish: false,
    movieStatus: 0,
    tvStart: false,
    tvFinish: false,
    tvStatus: 0,
    result: [],
    finished: false,
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getMovies = async () => {

    console.log("started")
    this.setState({movieStart: true})

    let movieId = []
    let movieCastId = new Set([]);

    let pageIndex = 1;

    for(let i = 1; i <= pageIndex; i++){

      if(i !== 0 && i % 30 === 0){
        await this.sleep(9000)
      }

      let movieApiCall = await fetch(`http://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_date.gte=2017-12-01&primary_release_date.lte=2017-12-31&with_release_type=2|3&page=${i}`);
      let movieData = await movieApiCall.json();

      if(pageIndex === 1){
        pageIndex = movieData.total_pages
      }

      movieData.results.forEach(title => {
        movieId.push(title.id)
      })
    }

    await this.sleep(3000)

    for (let i = 0; i < movieId.length; i++){

      console.log("loading ", i+1, " of ", movieId.length)
      this.setState({movieStatus: Math.round(i / movieId.length * 100) * 100 / 100 }, () => {
        console.log(this.state.movieStatus, ' %');
      })

      await this.sleep(200)

      const movieCastApi = await fetch(`https://api.themoviedb.org/3/movie/${movieId[i]}/credits?api_key=${API_KEY}`)
      const movieCastData = await movieCastApi.json();


      movieCastData.cast.forEach(cast => {
        movieCastId.add(cast.id)
      })
    }

    this.setState({movieFinish: true})

    return movieCastId;
  }

  getTV = async () => {
    console.log('Start loading TV shows Data')
    this.setState({tvStart: true})

    let tvId = []
    let tvCastId = new Set([]);

    let pageIndex = 1;

    for(let i = 1; i <= pageIndex; i++){

      if(i !== 0 && i % 30 === 0){
        console.log("wait")
        await this.sleep(9000)
      }

      let tvApiCall = await fetch(`http://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&air_date.gte=2017-12-01&air_date.lte=2017-12-31&append_to_response=credits&with_original_language=en&page=${i}`);
      let tvData = await tvApiCall.json();

      if(pageIndex === 1){
        pageIndex = tvData.total_pages
      }

      tvData.results.forEach(title => {
        tvId.push(title.id)
      })
    }

    await this.sleep(3000)

    for (let i = 0; i < tvId.length; i++){

      console.log("loading ", i+1, " of ", tvId.length)
      this.setState({tvStatus: Math.round(i / tvId.length * 100) * 100 / 100 }, () => {
        console.log(this.state.tvStatus, ' %');
      })

      await this.sleep(200)

      const tvCastApi = await fetch(`https://api.themoviedb.org/3/tv/${tvId[i]}/credits?api_key=${API_KEY}`)
      const tvCastData = await tvCastApi.json();


      tvCastData.cast.forEach(cast => {
        tvCastId.add(cast.id)
      })
    }

    this.setState({tvFinish: true})

    return tvCastId;
  }

  run = async() => {
    let result = []

    const movieCast = await this.getMovies();
    await this.sleep(3000)
    const tvCast = await this.getTV();

    movieCast.forEach(id => {
      if(tvCast.has(id)){
        result.push(id)
      }
    })

    console.log(result.length, result)
    this.setState({result, finished: true})

  }

  createTable = (result) => {
    let table = []
    let index = 0;
    let row = Math.ceil(index / 3)

    // Outer loop to create parent
    for (let i = 0; i < row; i++) {
      let children = []
      //Inner loop to create children
      for (let j = 0; j < 5; j++) {
        if (index < result.length){
          children.push(<td>{result[index]}</td>)
          index ++;
        }
        else{
          children.push(<td></td>)
        }
      }
      //Create the parent and add the children
      table.push(<tr>{children}</tr>)
    }
    return table
  }

  render() {
    return (
      <Container>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Movie API</h1>
        </header>
        <br />
        <p className="App-intro">
          To answer the Question:
        </p>
        <h2 className="App-intro">
        How many actors and actresses were in at least one movie and at least one tv episode
        in December 2017?
        </h2>
        <br />
        <p></p>
        <Button onClick={this.run}>Start</Button>
        <div><br /></div>

        {this.state.movieStart === false ? <div /> :
          ( this.state.movieFinish === true ? <Progress percent={100} success> Movie Data Complete! </Progress> :
          <Progress percent={this.state.movieStatus}> Loading Movie Data ({this.state.movieStatus} %) </Progress>
          )
        }
        <div><br /></div>

        {this.state.tvStart === false ? <div />:
          ( this.state.tvFinish === true ? <Progress percent={100} success> TV Data Complete! </Progress> :
          <Progress percent={this.state.tvStatus}> Loading TV Data ({this.state.tvStatus} %) </Progress>
          )
        }
        <div><br /></div>

        {this.state.finished === false ? <div /> :
          <div>
            <h4> The answer is: {this.state.result.length}</h4>
          </div>
        }
        </div>
      </Container>
    );
  }
}

export default App;
