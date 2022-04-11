import { Navbar } from '@components';
import Footer from '@components/footer';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@styles/Home.module.css';
import type { Driver, Race, Season } from '@types';
import Axios, { AxiosResponse } from 'axios';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Data } from 'plotly.js';
import { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { Button, Col, Container, FormSelect, Row } from 'react-bootstrap';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false
})

function Home() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [showGraph, setShowGraph] = useState<boolean>(false)
  const [race, setRace] = useState<string | undefined>(undefined);
  const [driver, setDriver] = useState<string>('all')
  const [season, setSeason] = useState<string | undefined>(undefined);
  const [laptimes, setLaptimes] = useState<{ [key: string]: string[] }>({})

  useEffect(() => {

    if (seasons.length <= 0) {
      Axios.get("../api/seasons").then((res: AxiosResponse<Season[]>) => {
        setSeasons(res.data);
      })
    }

    if (race !== undefined && season !== undefined) {
      if (process.env.NODE_ENV === "production") {
        window.onbeforeunload = () => {
          console.log('i get triggerd');
          return 'test';
        }
      }
      setLaptimes({})
      const url = `	/api/${season}/${race}/${driver !== 'all' ? `${driver}` : 'all'}`
      console.log(`url: ${url}`);
      Axios.get(url).then((res: AxiosResponse) => {
        console.log(res.data);
        setLaptimes(res.data);
        getDrivers(season).then(() => {
          setDrivers((drivers) => (drivers.filter((driver: Driver) => Object.keys(res.data).includes(driver.driverId))));
          setShowGraph(true);
        })
      })
    }
  }, [seasons, season, race, driver])

  const getDrivers = async (season: string) => {
    const url = `/api/${season}/drivers`
    const res: AxiosResponse<Driver[]> = await Axios.get(url)
    setDrivers(res.data);
  }


  const getRaces = async (season: string) => {
    const racesUrl = `/api/${season}/races`
    Axios.get(racesUrl).then((res: AxiosResponse<Race[]>) => {
      setRaces(res.data);
      setRace(res.data[0].round);
    })
  }

  const setSelectedSeason = (e: ChangeEvent<HTMLSelectElement>) => {
    reset();
    const season = e.currentTarget.value;
    setSeason(season);
    getRaces(season).finally(() => {
      getDrivers(season);
    })
  }

  const renderGraph = (): ReactElement => {
    const data: Data[] = [];
    let range: [number, number] | [] = [];
    for (let key of Object.keys(laptimes)) {
      const selectedDriver = drivers.filter((d: Driver) => d.driverId === key)[0]
      console.log(selectedDriver);
      if (range === null) range = [1, laptimes[key].length]
      console.log(range);
      const y = laptimes[key].map((time: string) => {
        const splitted = time.split(':')
        const minutes = parseInt(splitted[0], 10);
        const seconds = parseFloat(splitted[1])
        return parseFloat(((minutes * 60) + seconds).toFixed(3));
      })
      data.push({ name: `${selectedDriver.givenName} ${selectedDriver.familyName}`, y, text: laptimes[key], mode: 'lines+markers' });
    }
    const selectedRace = races.filter((r: Race) => r.round == race)[0];
    console.log(selectedRace);
    return (<Plot data={data}
      config={{ displaylogo: false }}
      style={{ width: '95vw', height: '80vh' }}
      className="mx-auto"
      layout={{ title: `${selectedRace.raceName} ${selectedRace.season}`, showlegend: true, xaxis: { autotick: false, ticks: 'outside', tick0: 1, dtick: 5, range: range } }}
    />)
  }

  const reset = () => {
    setShowGraph(false);
    setLaptimes({});
    setDriver('all');
    setRace(undefined);
    setSeason(undefined);
    setDrivers([]);
    setRaces([]);
    if(process.env.NODE_ENV === "production") window.onbeforeunload = null;
  }

  return (
    <div id="home">
      <Head>
        <title>F1Plot: Home</title>
      </Head>
      <Navbar />
      <Container fluid className='mt-3'>
        <Row className='mb-1' style={{ width: "95vw" }}>

          {/* Shows a list of all the seasons to select */}
          <Col className="d-flex align-items-center" sm={{ offset: 2 }}>
            <label className='me-2'>Season: </label>
            <FormSelect onChange={setSelectedSeason}>
              <option value={undefined} disabled>Select a option</option>
              {seasons.map((season: Season, index: number) => (
                <option key={index} value={season.season}>{season.season}</option>
              ))}
            </FormSelect>
          </Col>

          {/* Shows the dropdown of races from that season when the array size is bigger than 0 */}
          {races.length > 0 &&
            <Col className="d-flex align-items-center">
              <label className="me-2">Race: </label>
              <FormSelect onChange={(e) => setRace(e.target.value)}>
                <option value={undefined} disabled>Select a option</option>
                {races.map((race: Race, index: number) => (
                  <option disabled={new Date() < new Date(race.date)} key={index} value={race.round}>{`${race.raceName}`}</option>
                ))}
              </FormSelect>
            </Col>
          }

          {/* Shows the dropdown of drivers from that season when the array size is bigger than 0 */}
          {drivers.length > 0 &&
            <Col className="d-flex align-items-center">
              <label className="me-2">Driver: </label>
              <FormSelect value={driver} onChange={(e) => setDriver(e.target.value)}>
                <option value="all">All</option>
                {drivers.map((driver: Driver, index: number) => (
                  <option key={index} value={driver.driverId}>{`${driver.givenName} ${driver.familyName}`}</option>
                ))}
              </FormSelect>
            </Col>
          }
          
          {/* Shows the reset button if a race and a driver is selected from both dropdowns */}
          {race !== undefined && season !== undefined &&
            <Col className="d-flex align-items-center">
              <Button variant="danger" className='px-5' onClick={reset}>Reset <FontAwesomeIcon icon={faUndo} /></Button>
            </Col>
          }
        </Row>
        {showGraph && renderGraph()}
      </Container>
      <Footer />
    </div>
  )
}

export default Home
