import React, { Component } from "react";
import logo from "./logo.svg";
import album from "./album.svg";
import "./App.css";
import axios from "axios";
import Modal from "react-modal";
//import debounce from "lodash/debounce";

const getArtist = input => {
  return axios.get(
    `http://www.theaudiodb.com/api/v1/json/1/search.php?s=${input}`
  );
};

class App extends Component {
  state = {
    artist: null,
    albums: null,
    tracks: null,
    selected: {
      artist: null,
      album: null,
      released: null
    },
    display: "",
    modalIsOpen: false,
    paginatedAlbum: []
  };

  handleChange = e => {
    let artistName = e.target.value;
    getArtist(artistName).then(response => {
      this.setState({ artist: response.data.artists, display: "artist" });
    });
  };

  handleAlbum = (id, artist) => {
    axios
      .get(`http://www.theaudiodb.com/api/v1/json/1/album.php?i=${id}`)
      .then(response => {
        this.setState(prevState => ({
          albums: response.data.album,
          display: "album",
          selected: { ...prevState.selected, artist: artist },
          paginatedAlbum: response.data.album.slice(0, 6)
        }));
      });
  };

  handleTrack = (id, album, release) => {
    axios
      .get(`http://www.theaudiodb.com/api/v1/json/1/track.php?m=${id}`)
      .then(response => {
        this.setState(prevState => ({
          tracks: response.data.track,
          display: "track",
          modalIsOpen: true,
          selected: {
            ...prevState.selected,
            album: album,
            released: release
          },
          paginatedTrack: response.data.track.slice(0, 6)
        }));
      });
  };

  toggleModal = () => {
    this.setState(prevState => ({
      modalIsOpen: !prevState.modalIsOpen,
      display: "album"
    }));
  };

  handlePagination = (page) => {
    this.setState(prevState => {
      console.log(prevState.display, " prevState.display");
      if(prevState.display === "album") return { paginatedAlbum: prevState.albums.slice(page, page + 6) }
      else {
        return { paginatedTrack: prevState.tracks.slice(page, page + 6) };
      };
    });
  }

  render() {
    let { albums, paginatedAlbum, tracks, paginatedTrack } = this.state;
    console.log(albums,"albums", paginatedAlbum, "paginatedAlbum")
    return <div className="App-intro">
        <nav className="navbar navbar-light bg-light">
          <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" onChange={this.handleChange} />
        </nav>
        <div className="container-fluid">
          <div className="row">
            {this.state.display === "artist" && !!this.state.artist && this.state.artist.map(
                ({ strArtist, idArtist, strArtistThumb = album }) => {
                  return (
                    <div className="card col-sm-6 col-md-4 col-xs-12">
                      <img
                        className="card-img-top"
                        src={strArtistThumb}
                        alt="artist"
                      />
                      <div className="card-body">
                        <h5 className="card-title">{strArtist}</h5>
                        <button
                          className="btn btn-primary"
                          onClick={this.handleAlbum.bind(
                            this,
                            idArtist,
                            strArtist
                          )}
                        >
                          View Albums
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
          </div>
          <div>
            {(this.state.display === "album" || this.state.display === "track") && !!this.state.albums && <div>
                  {this.state.paginatedAlbum.map(
                    ({
                      strAlbum,
                      idAlbum,
                      strAlbumThumb,
                      intYearReleased
                    }) => {
                      return (
                        <div className="card">
                          <div className="card-body card-body d-flex">
                            <div
                              style={{
                                minWidth: "70px",
                                maxWidth: "100px",
                                height: "auto"
                              }}
                            >
                              <img
                                className="card-img-top"
                                src={
                                  !strAlbumThumb ||
                                  strAlbumThumb.length == 0
                                    ? album
                                    : strAlbumThumb
                                }
                                alt="Card album"
                              />
                            </div>
                            <div className="album-details mx-4 my-auto">
                              <h5>{strAlbum}</h5>
                              <button
                                className="btn btn-primary"
                                onClick={this.handleTrack.bind(
                                  this,
                                  idAlbum,
                                  strAlbum,
                                  intYearReleased
                                )}
                              >
                                View Track
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                  <footer class="d-flex justify-content-center my-3">
                    <ul className="pagination mb-0">
                      {albums
                        .filter((album, index) => index < albums.length / 6)
                        .map((state, index) => (
                          <li className="page-item">
                            <button
                              className="page-link"
                              onClick={this.handlePagination.bind(
                                this,
                                index * 6
                              )}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </footer>
                </div>}
          </div>
          {this.state.display === "track" && <Modal ariaHideApp={false} isOpen={this.state.modalIsOpen} onAfterOpen={this.afterOpenModal} onRequestClose={this.closeModal} contentLabel="Example Modal">
              <div className="modal-content">
                <div className="modal-header">
                  <div className="w-100">
                    <h4 className="modal-title">
                      <span>Album: {this.state.selected.album}</span>
                      <span className="float-right">
                        Released: {this.state.selected.released}
                      </span>
                    </h4>
                  </div>
                  <button type="button" className="close" onClick={this.toggleModal}>
                    <span aria-hidden="true">&times;</span>
                    <span className="sr-only">Close</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="card">
                    <div className="card-body p-0">
                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Duration</th>
                            <th scope="col">Artist</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!!this.state.tracks && this.state.paginatedTrack.map(
                              ({
                                strAlbum,
                                idAlbum,
                                intDuration,
                                strArtist,
                                idTrack
                              }) => (
                                <React.Fragment>
                                  <tr>
                                    <td>{idTrack}</td>
                                    <td>{intDuration / 100}(sec)</td>
                                    <td>{strArtist}</td>
                                  </tr>
                                </React.Fragment>
                              )
                            )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div class="modal-footer py-2">
                  <ul className="pagination mb-0">
                    {tracks
                      .filter((album, index) => index < tracks.length / 6)
                      .map((state, index) => (
                        <li className="page-item">
                          <button
                            className="page-link"
                            onClick={this.handlePagination.bind(
                              this,
                              index * 6
                            )}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </Modal>}
        </div>
      </div>;
  }
}

export default App;
