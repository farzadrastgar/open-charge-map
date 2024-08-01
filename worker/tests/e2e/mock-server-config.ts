import axios from "axios";
import data from "./mock-data.json";

export async function setupExpectations() {
  try {
    await axios.put(`${process.env.MOCK_SERVER}/mockserver/expectation`, {
      httpRequest: {
        method: "GET",
        path: "/v3/poi",
        queryStringParameters: {
          output: ["json"],
          countrycode: ["country1"],
          boundingbox: ["(0,0),(5,10)"],
          maxresults: [process.env.MAX_FETCH_BLOCK],
          compact: ["true"],
          verbose: ["false"],
          key: [process.env.API_KEY],
        },
      },
      httpResponse: {
        statusCode: 200,
        body: JSON.stringify(
          data.slice(0, Number(process.env.MAX_FETCH_BLOCK))
        ),
        headers: {
          "Content-Type": ["application/json"],
        },
      },
    });

    await axios.put(`${process.env.MOCK_SERVER}/mockserver/expectation`, {
      httpRequest: {
        method: "GET",
        path: "/v3/poi",
        queryStringParameters: {
          output: ["json"],
          countrycode: ["country2"],
          boundingbox: ["(0,0),(5,10)"],
          maxresults: [process.env.MAX_FETCH_BLOCK],
          compact: ["true"],
          verbose: ["false"],
          key: [process.env.API_KEY],
        },
      },
      httpResponse: {
        statusCode: 200,
        body: JSON.stringify(
          data.slice(0, Math.ceil(Number(process.env.MAX_FETCH_BLOCK) / 2))
        ),
        headers: {
          "Content-Type": ["application/json"],
        },
      },
    });
  } catch (error) {
    console.error("Error setting up expectation:", error);
  }
}
