import React from "react";
import plotly from "plotly.js/dist/plotly";
import createPlotComponent from "react-plotly.js/factory";
import Head from "next/head";
import Script from "next/script";
import Link from "next/link";
import Router, { useRouter } from "next/router";

import styles from "./analytics.module.css";

var dataJson = require("../assets/DemoData.json");
const Plot = createPlotComponent(plotly);

const layout = {
  width: 600,
  height: 400,
  title: "CoP vs CDWET",
};

const splitTupleSum = (data) => {
  data = data.replaceAll("(", "").replaceAll(")", "");
  data = data
    .split(",")
    .map((ele) => parseFloat(ele))
    .reduce((partialSum, a) => partialSum + a, 0);
  return data;
};


const splitTuple = (data) => {
  data = data.replaceAll("(", "").replaceAll(")", "");
  data = data
    .split(",")
    .map((ele) => parseFloat(ele))
  return data;
};


const findSid = (sequence) => {
  var chLs = [];
  for (let i = 0; i < sequence.length; i++) {
    if (sequence[i] === "1") {
      chLs.push(i + 1);
    }
  }
  return chLs;
};

export default ({ data }) => {
  const [chartType, setChartType] = React.useState();
  console.log(data);
  let res = dataJson.filter(
    (ele) =>
      ele["CL_bin"] === data["CL_bin"] && ele["WB_bin"] === data["WB_bin"]
  )[0];
  console.log(res);
  res = res.Text.replaceAll("<b>", "")
    .replaceAll("</b>", "")
    .split("Strategy:")
    .filter((ele) => ele.length)
    .map((ele) =>
      ele.split(
        "<br><br>  _CoP|______________CT_Seq|___________CH_CoP|Cdwt|Ct|<br>"
      )
    );
  let keys = ["Strategy", "AP", "CoP", "Count"];
  let key2 = ["CoP", "CT_Seq", "CH_CoP", "CDWT", "Count"];
  let pattern = / [0-9.]*/g;
  var res1 = res
    .map((ele) =>
      ele[0]
        .split("<br>")
        .map((ele) =>
          ele
            .match(pattern)
            .map((ele) => ele.replaceAll(" ", ""))
            .filter((ele) => ele.length)
        )
        .filter((ele) => ele.length === 1)
        .map((ele) => ele[0])
    )
    .map((ele) => Object.fromEntries(keys.map((k, i) => [k, ele[i]])));
  console.log(res1);
  var res2 = res
    .map((ele) => ele[1])
    .map((ele) =>
      ele
        .split("<br>")
        .map((ele) => ele.replaceAll(" ", ""))
        .filter((ele) => ele.length)
        .map((ele) =>
          Object.fromEntries(key2.map((k, i) => [k, ele.split("|")[i]]))
        )
    );
  console.log(res2);
  let res3 = [];
  res1.map((ele, index) => res3.push({ ...ele, ...{ result: res2[index] } }));
  console.log(res3);
  return (
    <div className={styles.divClass}>
      {res3.map((ele, index) => (
        <div key={index}>
          <p>
            Strategy: {ele.Strategy}, AP_mean: {ele.AP}, CoP: {ele.CoP}, Count:{" "}
            {ele.Count}
          </p>
          <p>
            Chillers running are{" "}
            {JSON.stringify(findSid(ele.Strategy))
              .replace("[", "")
              .replace("]", "")}
          </p>
          <Plot
            key={index}
            data={[
              {
                x: ele.result.map((el) => parseFloat(el["CDWT"])),
                y: ele.result.map((el) => parseFloat(el["CoP"])),
                text: ele.result.map(
                  (el) =>
                    `Count: ${el["Count"]}<br>CT_Energy: ${splitTupleSum(
                      el["CT_Seq"]
                    )}`
                ),
                // type: "bar",
                marker: {
                  size: ele.result.map(
                    (el) => (parseFloat(el["Count"]) + 2) * 3
                  ),
                  color: ele.result.map((el) => splitTupleSum(el["CT_Seq"])),
                  colorbar: { title: "CT_Energy", titleside: "Top" },
                  colorscale: [
                    ["0.0", "rgb(165,0,38)"],
                    ["0.111111111111", "rgb(215,48,39)"],
                    ["0.222222222222", "rgb(244,109,67)"],
                    ["0.333333333333", "rgb(253,174,97)"],
                    ["0.444444444444", "rgb(254,224,144)"],
                    ["0.555555555556", "rgb(224,243,248)"],
                    ["0.666666666667", "rgb(171,217,233)"],
                    ["0.777777777778", "rgb(116,173,209)"],
                    ["0.888888888889", "rgb(69,117,180)"],
                    ["1.0", "rgb(49,54,149)"],
                  ],
                },
                mode: "markers",
              },
            ]}
            layout={layout}
          ></Plot>
          <Plot
            // key={index}
            data={
              findSid(ele.Strategy).map(ele2 => {
                console.log(ele2)
                return {
                  x: ele.result.map((el) => parseFloat(el["CDWT"])),
                  y: ele.result.map((el) => {console.log(splitTuple(el["CH_CoP"])); return splitTuple(el["CH_CoP"])}).map(ell => ell[ele2-1]),
                  text: ele.result.map(
                    (el) =>
                      `Count: ${el["Count"]}<br>CH_CoP: ${JSON.stringify(splitTuple(
                        el["CH_CoP"]
                      ))}`
                  ),
                  // type: "bar",
                  name: `Chiller_${ele2}`,
                  marker: {
                    // size: ele.result.map(
                    //   (el) => (parseFloat(el["Count"]) + 2) * 3
                    // ),
                    // color: ele.result.map((el) => splitTupleSum(el["CT_Seq"])),
                    // colorbar: { title: "CT_Energy", titleside: "Top" },
                    // colorscale: [
                    //   ["0.0", "rgb(165,0,38)"],
                    //   ["0.111111111111", "rgb(215,48,39)"],
                    //   ["0.222222222222", "rgb(244,109,67)"],
                    //   ["0.333333333333", "rgb(253,174,97)"],
                    //   ["0.444444444444", "rgb(254,224,144)"],
                    //   ["0.555555555556", "rgb(224,243,248)"],
                    //   ["0.666666666667", "rgb(171,217,233)"],
                    //   ["0.777777777778", "rgb(116,173,209)"],
                    //   ["0.888888888889", "rgb(69,117,180)"],
                    //   ["1.0", "rgb(49,54,149)"],
                    // ],
                  },
                  // mode: "markers",
                }
              })}
            layout={layout}
          ></Plot>
        </div>
      ))}
    </div>
  );
};
