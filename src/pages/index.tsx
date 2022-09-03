import { Footer, Navbar } from "@components";
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@styles/Home.module.css";
import type { Driver, Race, Season } from "@types";
import Axios, { AxiosResponse } from "axios";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Data } from "plotly.js";
import React, {
  ChangeEvent,
  createRef,
  ReactElement,
  useEffect,
  useState,
} from "react";
import {
  Button,
  Col,
  Container,
  FormLabel,
  FormSelect,
  Row,
} from "react-bootstrap";

// Dynamicly loads the Plot component from react-ploty.js
const Plot = dynamic(() => import("react-plotly.js"), {
  // Disables SSR for loading this component
  ssr: false,
});

export default function Home() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [race, setRace] = useState<string | undefined>(undefined);
  const [driver, setDriver] = useState<string>("all");
  const [season, setSeason] = useState<string | undefined>(undefined);
  const [laptimes, setLaptimes] = useState<{ [key: string]: { position: string; time: string; }[] }>({});
  const seasonRef = createRef<HTMLSelectElement>();
  const raceRef = createRef<HTMLSelectElement>();

  /**
   * Function to reset the site back to it initial state
   * @returns {void}
   */
  const reset = (): void => {
    setRaces([]);
    setDrivers([]);
    setShowGraph(false);
    setLaptimes({});
    setDriver("all");
    setRace(undefined);
    setSeason(undefined);
    if (process.env.NODE_ENV === "production") window.onbeforeunload = null;
  };

  /**
   * This function this to all the drivers from the selected season from the API
   * @param {string} selectedSeason
   * @returns {Promise<void>}
   */
  const getDrivers = async (selectedSeason: string): Promise<void> => {
    // URL of the API endpoint for the seasons drivers
    const url = `/api/${selectedSeason}/drivers`;
    const res: AxiosResponse<Driver[]> = await Axios.get(url);
    setDrivers(res.data);
  };

  /**
   * This function this to all the races from the selected season from the API
   * @param {string} selectedSeason
   * @returns {Promise<void>}
   */
  const getRaces = async (selectedSeason: string): Promise<void> => {
    const racesUrl = `/api/${selectedSeason}/races`;
    Axios.get(racesUrl).then((res: AxiosResponse<Race[]>) => {
      setRaces(res.data);
      setRace(res.data[0].round);
    });
  };

  useEffect((): void => {
    // console.log(seasonRef);
    if (seasons.length <= 0) {
      Axios.get("../api/seasons").then((res: AxiosResponse<Season[]>) => {
        setSeasons(res.data);
      });
    }

    if (race !== undefined && season !== undefined) {
      if (process.env.NODE_ENV === "production") {
        window.onbeforeunload = () => {
          return true;
        };
      }
      // if (typeof raceRef race !== raceRef.current.value) setDrivers([]);
      // if(season !== seasonRef.current.value) s([]);
      setLaptimes({});
      // setDrivers([]);
      setShowGraph(false);
      const url = `/api/${season}/${race}/${
        driver !== "all" ? `${driver}` : "all"
      }`;
      Axios.get(url)
        .then((res: AxiosResponse) => {
          setLaptimes(res.data);
          getDrivers(season).then(() => {
            setDrivers((oldDrivers: Driver[]) =>
              oldDrivers.filter((d: Driver) =>
                Object.keys(res.data).includes(d.driverId)
              )
            );
          });
        })
        .finally(() => {
          setShowGraph(true);
        });
    }
  }, [seasons, season, race, driver]);

  /**
   * Set the season that is selected and gets the drivers from that season
   * @param {ChangeEvent<HTMLSelectElement>} e
   */
  const setSelectedSeason = (e: ChangeEvent<HTMLSelectElement>): void => {
    reset();
    const selectedSeason = e.currentTarget.value;
    setSeason(selectedSeason);
    getRaces(selectedSeason).finally(() => {
      getDrivers(selectedSeason);
    });
  };

  /**
   * Function to create the graph that gets renderd
   * @returns {ReactElement} Graph element
   */
  const renderGraph = (): ReactElement => {
    const data: Data[] = [];
    let range: [number, number] | [] = [];
    Object.keys(laptimes).forEach((key: string) => {
      const selectedDriver = drivers.filter(
        (d: Driver) => d.driverId === key
      )[0];
      console.log(selectedDriver);
      if (range === null) range = [1, laptimes[key].length];
      const y = laptimes[key].map(({time}) => {
        const splitted = time.split(":");
        const minutes = parseInt(splitted[0], 10);
        const seconds = parseFloat(splitted[1]);
        return parseFloat((minutes * 60 + seconds).toFixed(3));
      });
      if(selectedDriver !== undefined) {
        data.push({
          name: `${selectedDriver.givenName} ${selectedDriver.familyName}`,
          y,
          text: laptimes[key].map(({position, time}) => {
            return `${time} (position: ${position})`
          }),
          mode: "lines+markers",
        });
      }
    });
    const selectedRace = races.filter((r: Race) => r.round === race)[0];
    return (
      <Plot
        data={data}
        config={{ displaylogo: false }}
        style={{ width: "95vw", height: "80vh" }}
        className="mx-auto"
        layout={{
          title: `${selectedRace.raceName} ${selectedRace.season}`,
          showlegend: true,
          xaxis: {
            autotick: false,
            ticks: "outside",
            tick0: 1,
            dtick: 5,
            range,
          },
        }}
      />
    );
  };

  return (
    <div id="home">
      <Head>
        <title>F1Plot: Home</title>
      </Head>
      <Navbar />
      <Row />
      <Container fluid className="mt-3">
        <Row className="mb-1" style={{ width: "95vw" }}>
          {/* Shows a list of all the seasons to select */}
          <Col className="d-flex align-items-center" sm={{ offset: 2 }}>
            <FormLabel className="me-2" htmlFor="season">
              Season:
            </FormLabel>
            <FormSelect
              onChange={setSelectedSeason}
              name="season"
              ref={seasonRef}
            >
              <option value={undefined} disabled>
                Select a option
              </option>
              {seasons.map((currentSeason: Season) => (
                <option key={currentSeason.season} value={currentSeason.season}>
                  {currentSeason.season}
                </option>
              ))}
            </FormSelect>
          </Col>

          {/* Shows the dropdown of races from that season when the array size is bigger than 0 */}
          {races.length > 0 && (
            <Col className="d-flex align-items-center">
              <FormLabel className="me-2" htmlFor="race">
                Race:&nbsp;
              </FormLabel>
              <FormSelect
                name="race"
                onChange={(e) => setRace(e.target.value)}
                ref={raceRef}
              >
                <option value={undefined} disabled>
                  Select a option
                </option>
                {races.map((currentRace: Race) => (
                  <option
                    disabled={new Date() < new Date(currentRace.date)}
                    key={currentRace.raceName}
                    value={currentRace.round}
                  >{`${currentRace.raceName}`}</option>
                ))}
              </FormSelect>
            </Col>
          )}

          {/* Shows the dropdown of drivers from that season when the array size is bigger than 0 */}
          {drivers.length > 0 && (
            <Col className="d-flex align-items-center">
              <FormLabel className="me-2" htmlFor="driver">
                Driver:
              </FormLabel>
              <FormSelect
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                name="driver"
              >
                <option value="all">All</option>
                {drivers.map((currentDriver: Driver) => (
                  <option
                    key={currentDriver.code}
                    value={currentDriver.driverId}
                  >{`${currentDriver.givenName} ${currentDriver.familyName}`}</option>
                ))}
              </FormSelect>
            </Col>
          )}

          {/* Shows the reset button if a race and a driver is selected from both dropdowns */}
          {race !== undefined && season !== undefined && (
            <Col className="d-flex align-items-center">
              <Button variant="danger" className="px-5" onClick={reset}>
                Reset <FontAwesomeIcon icon={faUndo} />
              </Button>
            </Col>
          )}
        </Row>
        {showGraph && renderGraph()}
      </Container>
      <Footer />
    </div>
  );
}
