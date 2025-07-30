import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  // const [watched, setWatched] = useState([]);
  // const [watched, setWatched] = useState(function () {
  //   const storedValue = localStorage.getItem("watched");
  //   return JSON.parse(storedValue);
  // });

  function handleSelectMovie(id) {
    setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((movie) => movie.filter((movie) => movie.imdbID !== id));
  }

  // useEffect(
  //   function () {
  //     localStorage.setItem("watched", JSON.stringify(watched));
  //   },
  //   [watched]
  // );

  return (
    <>
      <NavBar>
        <NumResults movies={movies} />
        <Search query={query} setQuery={setQuery} />
        <Logo />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>

        {/* <Box element={<MovieList movies={movies} />} />
        <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          }
        /> */}
      </Main>
    </>
  );
}

const NavBar = ({ children }) => {
  return (
    <>
      <nav className="nav-bar">{children}</nav>
    </>
  );
};

const Search = ({ query, setQuery }) => {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <>
      <input
        className="search"
        type="text"
        placeholder="... نام فیلم , سریال مورد نظر را وارد کنید"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
    </>
  );
};

const Logo = () => {
  return (
    <>
      <div className="logo">
        <h1>IMDeeBee</h1>
        <span role="img">🍿</span>
      </div>
    </>
  );
};

const Loader = () => {
  return (
    <>
      <p className="loader">... لطفا صبر کنید</p>
    </>
  );
};

const ErrorMessage = ({ message }) => {
  return (
    <>
      <p className="error">
        {message} <span>⛔</span>
      </p>
    </>
  );
};

const NumResults = ({ movies }) => {
  return (
    <>
      <p className="num-results">
        تعداد نتیجه: <strong>{movies.length}</strong>
      </p>
    </>
  );
};

const Main = ({ children }) => {
  return (
    <>
      <main className="main">{children}</main>
    </>
  );
};

const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <div className="box">
        <button
          className="btn-toggle"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? "–" : "+"}
        </button>
        {isOpen && children}
      </div>
    </>
  );
};

/*
const WatchedBox = ({ children }) => {
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <>
      <div className="box">
        <button
          className="btn-toggle"
          onClick={() => setIsOpen2((open) => !open)}
        >
          {isOpen2 ? "–" : "+"}
        </button>
        {isOpen2 && children}
      </div>
    </>
  );
};
*/

const MovieList = ({ movies, onSelectMovie }) => {
  return (
    <>
      <ul className="list list-movies">
        {movies?.map((movie) => (
          <Movie
            movie={movie}
            key={movie.imdbID}
            onSelectMovie={onSelectMovie}
          />
        ))}
      </ul>
    </>
  );
};

const Movie = ({ movie, onSelectMovie }) => {
  return (
    <>
      <li onClick={() => onSelectMovie(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>🗓️</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </li>
    </>
  );
};

const MovieDetails = ({ selectedId, onCloseMovie, onAddWatched, watched }) => {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current += 1;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  const [isTop, setIsTop] = useState(imdbRating > 8);
  console.log(isTop);
  useEffect(
    function () {
      setIsTop(imdbRating > 8);
    },
    [imdbRating]
  );

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      poster,
      year,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?i=${selectedId}&apikey=${
            import.meta.env.VITE_OMDB_KEY
          }`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return; // Don't show undefined when the title not loaded
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
        // console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title]
  );

  useKey("Escape", onCloseMovie);

  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (e.code === "Escape") {
  //         onCloseMovie();
  //         console.log("CLOSED BY KEY");
  //       }
  //     }

  //     document.addEventListener("keydown", callback);

  //     return function () {
  //       document.removeEventListener("keydown", callback);
  //       // To close just once when MovieDetails is open
  //     };
  //   },
  //   [onCloseMovie]
  // );

  return (
    <>
      <div className="details">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <header>
              <button className="btn-back" onClick={onCloseMovie}>
                &larr;
              </button>
              <img src={poster} alt={`Poster of ${movie} movie`} />
              <div className="details-overview">
                <h2>{title}</h2>
                <p>
                  {released} &bull; {runtime}
                </p>
                <p>{genre}</p>
                <p style={{ display: "flex", direction: "rtl" }}>
                  <span>⭐</span>
                  {imdbRating} امتیاز IMDb
                </p>
              </div>
            </header>

            <section>
              <div className="rating">
                {!isWatched ? (
                  <>
                    <StarRating
                      maxRating={10}
                      size={24}
                      onSetRating={setUserRating}
                    />

                    {userRating > 0 && (
                      <button className="btn-add" onClick={handleAdd}>
                        افزودن به لیست امتیاز ها +
                      </button>
                    )}
                  </>
                ) : (
                  <p style={{ display: "flex", direction: "rtl" }}>
                    <span>🌟</span> شما امتیاز {watchedUserRating} به این فیلم
                    داده اید!
                  </p>
                )}
              </div>
              <p
                style={{
                  display: "flex",
                  direction: "rtl",
                }}
              >
                خلاصه داستان:
              </p>
              <em>{plot}</em>
              <p
                style={{
                  display: "flex",
                  direction: "rtl",
                }}
              >
                بازیگران:
                <br /> {actors}
              </p>
              <p
                style={{
                  display: "flex",
                  direction: "rtl",
                }}
              >
                کارگردان:
                <br /> {director}
              </p>
            </section>
          </>
        )}
      </div>
    </>
  );
};

const WatchedSummary = ({ watched }) => {
  const avgImdbRating = average(
    watched
      .map((movie) => movie.imdbRating)
      .filter((rating) => typeof rating === "number" && !isNaN(rating))
  );
  const avgUserRating = average(
    watched
      .map((movie) => movie.userRating)
      .filter((rating) => typeof rating === "number" && !isNaN(rating))
  );
  const avgRuntime = average(
    watched
      .map((movie) => movie.runtime)
      .filter((rating) => typeof rating === "number" && !isNaN(rating))
  );

  return (
    <>
      <div className="summary">
        <h2>فیلم‌هایی که تماشا کرده‌اید</h2>
        <div>
          <p>
            <span>#️⃣</span>
            <span>{watched.length} فیلم</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{avgImdbRating.toFixed(1)}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{avgUserRating.toFixed(1)}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{avgRuntime.toFixed()} دقیقه</span>
          </p>
        </div>
      </div>
    </>
  );
};

const WatchedMoviesList = ({ watched, onDeleteWatched }) => {
  return (
    <>
      <ul className="list">
        {watched.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            onDeleteWatched={onDeleteWatched}
          />
        ))}
      </ul>
    </>
  );
};

const WatchedMovie = ({ movie, onDeleteWatched }) => {
  return (
    <>
      <li>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>

          <button
            className="btn-delete"
            onClick={() => onDeleteWatched(movie.imdbID)}
          >
            X
          </button>
        </div>
      </li>
    </>
  );
};
