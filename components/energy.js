import React from "react";
import plotly from "plotly.js/dist/plotly";
import createPlotComponent from "react-plotly.js/factory";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";
import Script from "next/script";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { Provider } from "react-redux";
import { store } from "../app/store";
import {
  incrementByAmount,
  selectPartialState,
  initalDataAsync,
  copDataAsync,
  energyDataAsync,
} from "../features/tool/toolSlice";

const Plot = createPlotComponent(plotly);

const layout = {
  width: 1600,
  height: 600,
  title: "Energy Plot",
};

const EnergyPlot = ({ chillerNo }) => {
  const databaseName = "Sands";
  const queryString = "SELECT * FROM energy_chiller";
  const energyData = useSelector(selectPartialState("energyData"));
  const dispatch = useDispatch();
  const status = useSelector(selectPartialState("status"));

  React.useEffect(() => {
    console.log("fetching data...");
    dispatch(energyDataAsync({ databaseName, queryString }));
  }, []);

  React.useEffect(() => {
    console.log(status);
  }, [status]);

  if (!energyData.length) {
    return <div>LOADING...</div>;
  }
  console.log(energyData, chillerNo);
  return (
    <div>
      <Plot
        data={[
          {
            x: energyData.map((el) => el["Time"]),
            y: energyData.map((el) => el[chillerNo.chillerNo]),
            //   marker: {
            //     size: 12,
            //     color: copData.map((el) => el["cdwet"]),
            //     colorbar: { title: "cdwet", titleside: "Top" },
            //     colorscale: [
            //       ["0.0", "rgb(165,0,38)"],
            //       ["0.111111111111", "rgb(215,48,39)"],
            //       ["0.222222222222", "rgb(244,109,67)"],
            //       ["0.333333333333", "rgb(253,174,97)"],
            //       ["0.444444444444", "rgb(254,224,144)"],
            //       ["0.555555555556", "rgb(224,243,248)"],
            //       ["0.666666666667", "rgb(171,217,233)"],
            //       ["0.777777777778", "rgb(116,173,209)"],
            //       ["0.888888888889", "rgb(69,117,180)"],
            //       ["1.0", "rgb(49,54,149)"],
            //     ],
            //   },
            mode: "lines",
          },
        ]}
        layout={layout}
      ></Plot>
    </div>
  );
};

export default ({ chillerNo }) => {
  return (
    <Provider store={store}>
      <EnergyPlot chillerNo={chillerNo}></EnergyPlot>
    </Provider>
  );
};
