import type { Driver, Race, Season } from '@types';
import Axios, { AxiosResponse } from 'axios';
import dynamic from 'next/dynamic';
import { Data } from 'plotly.js';
import { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { Col, Container, FormSelect, Row } from 'react-bootstrap';
import Navbar from '@components/navbar';
import '@styles/Home.module.css'
import Footer from '@components/footer';
import Head from 'next/head';

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
  const [season, setSeason] = useState<string | undefined>(undefined)
  const [laptimes, setLaptimes] = useState<{ [key: string]: string[] }>({})

  useEffect(() => {

    if (seasons.length <= 0) {
      Axios.get("../api/seasons").then((res: AxiosResponse<Season[]>) => {
        setSeasons(res.data);
      })
    }

    if (race !== undefined && season !== undefined) {
      setLaptimes({})
      const url = `	/api/${season}/${race}/${driver !== 'all' ? `${driver}` : 'all'}`
      console.log(`url: ${url}`);
      Axios.get(url).then((res: AxiosResponse) => {
        console.log(res.data);
        setLaptimes(res.data);
      }).finally(() => {
        setShowGraph(true);
      })
    }
  }, [seasons, season, race, driver, drivers])


  const getDriversAndRaces = async (season: string) => {
    const driversUrl = `/api/${season}/drivers`
    const racesUrl = `/api/${season}/races`

    Axios.get(driversUrl).then((res: AxiosResponse<Driver[]>) => {
      setDrivers(res.data);
    }).finally(() => {
      Axios.get(racesUrl).then((res: AxiosResponse<Race[]>) => {
        setRaces(res.data);
        setRace(res.data[0].round);
      })
    })
  }

  const setSelectedSeason = (e: ChangeEvent<HTMLSelectElement>) => {
    setSeason(e.currentTarget.value);
    getDriversAndRaces(e.currentTarget.value);
  }

  const renderGraph = (): ReactElement => {
    const data: Data[] = [];
    let range: [number, number] | [] = [];
    for (let key of Object.keys(laptimes)) {
      const selectedDriver = drivers.filter((d: Driver) => d.driverId === key)[0]
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
      layout={{ width: window.innerWidth - 90, height: 800, title: `${selectedRace.raceName} ${selectedRace.season}`, showlegend: true, xaxis: { autotick: false, ticks: 'outside', tick0: 1, dtick: 5, range: range } }}
    />)
  }

  return (
    <div id="home">
      <Head>
        <title>F1Plot: Home</title>
      </Head>
      <Navbar />
      <Container fluid className='mt-3'>
        <Row>
          <Col>
            <FormSelect onChange={setSelectedSeason}>
              <option value={undefined} disabled>Select a option</option>
              {seasons.map((season: Season, index: number) => (
                <option key={index} value={season.season}>{season.season}</option>
              ))}
            </FormSelect>
          </Col>
          {races.length > 0 && <Col>
            <FormSelect onChange={(e) => setRace(e.target.value)}>
              <option value={undefined} disabled>Select a option</option>
              {races.map((race: Race, index: number) => (
                <option disabled={new Date() < new Date(race.date)} key={index} value={race.round}>{`${race.raceName}`}</option>
              ))}
            </FormSelect>
          </Col>}
          {drivers.length > 0 && <Col>
            <FormSelect value={driver} onChange={(e) => setDriver(e.target.value)}>
              <option value="all">All</option>
              {drivers.map((driver: Driver, index: number) => (
                <option key={index} value={driver.driverId}>{`${driver.givenName} ${driver.familyName}`}</option>
              ))}
            </FormSelect>
          </Col>}
        </Row>
        {showGraph && renderGraph()}
      </Container>
      <Footer />
    </div>
  )
}

export default Home
