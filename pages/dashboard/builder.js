import React from "react";
import axios from "axios";
import { Provider } from "react-redux";
import { store } from "../../app/store";
import Select from "react-select";
import ReactECharts from "echarts-for-react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import dynamic from "next/dynamic";
import * as echarts from "echarts";
import QueryApi from "../../services/query/queryApi";
// import {SET_QUERY_TIME_SERIES_DATA, API_CONFIG} from '../../tools'
// import DefaultChartOption from "../../components/options";

const API_CONFIG = {
  DASHBOARD_DATABASE: "ArupDemo",
  DASHBOARD_DATABASE_TABLE: "OTP",
};

const SET_QUERY_TIME_SERIES_DATA = (
  params,
  startTime,
  endTime,
  limit = 100
) => {
  if (!params || !params.length) {
    return "";
  }
  var startStr = "";
  if (typeof startTime === "string") {
    startStr = `, startTime: "${startTime}"`;
  }
  var endStr = "";
  if (typeof endTime === "string") {
    endStr = `, endTime: "${endTime}"`;
  }
  let queryStr = "query { \n";
  params.map((item, index) => {
    let num = index + 1;
    let rowStr = `point${num}:timeseriesbyprefername(limit:${limit}, 
      pointName:"${item}"${startStr}${endStr}, database:"${API_CONFIG.DASHBOARD_DATABASE}"
      , measurement:"${API_CONFIG.DASHBOARD_DATABASE_TABLE}"){
        prefername
        time
        value
      }`;
    queryStr = queryStr + "\n" + rowStr;
  });
  queryStr = queryStr + "}";
  return queryStr;
};

class EChartS extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myChart: null,
      type: "",
      componentConf: {},
      styleHeight: -1,
      styleWidth: -1,
      chartType: "",
    };
    this.Ref = React.createRef();
  }
  componentDidMount = () => {
    console.log(this.getComponentConf());

    // this.initConfigChart()
  };

  componentDidUpdate = (prevProps, prevState, snapshot) => {
    console.log(this.state.componentConf);
    if (JSON.stringify(prevState.componentConf) == "{}") {
      this.initConfigChart();
    }
    console.log(this.Ref.current.clientHeight, this.Ref.current.clientWidth);
  };

  initConfigChart = () => {
    let componentConf = this.state.componentConf;
    console.log(componentConf);
    let componentConfChartJson = this.state.componentConf.chartJson;
    if (JSON.stringify(componentConfChartJson) == "{}") {
      return;
    }
    this.setState({ chartType: componentConfChartJson.chartType });
    let chartJson = {
      type: componentConfChartJson.chartType,
      title: {
        text: componentConfChartJson.title.text || "",
        subtext: componentConfChartJson.title.subtext || "",
        left: componentConfChartJson.title.left || "left", // 'left', 'center', 'right'
        top: componentConfChartJson.title.top || "top", // 'top', 'middle', 'bottom'
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            show: false,
          },
        },
      },
      legend: {
        z: 0,
        show: componentConfChartJson.legend.show,
        orient: componentConfChartJson.legend.orient,
        data: componentConfChartJson.legend.data || [],
        left: componentConfChartJson.legend.left || "left", // 'left', 'center', 'right'
        top: componentConfChartJson.legend.top || "bottom", // 'top', 'middle', 'bottom'
        icon: componentConfChartJson.legend.icon || "circle", //  ????????????????????????  ???????????? circle???rect ???roundRect???triangle???diamond???pin???arrow???none
      },
      grid: {
        top: (componentConfChartJson.grid.top || 60) + "px",
        bottom: (componentConfChartJson.grid.bottom || 30) + "px",
        right: (componentConfChartJson.grid.right || 30) + "px",
        left: (componentConfChartJson.grid.left || 30) + "px",
      },
      xAxis: {
        position: "bottom",
        // boundaryGap: false,
        type: componentConfChartJson.xAxis.type || "category", // 'value' 'category'
        data: componentConfChartJson.xAxis.data || [],
        name: componentConfChartJson.xAxis.name || "", // ??????X????????????
        // AH - X???????????????
        // z: 0,
        nameLocation: "end",
        // nameTextStyle: {
        //   fontSize: 18, // ????????????
        //   fontWeight: 400, // ????????????
        //   color: "#fff", // ????????????
        //   padding: [10, 0, 0, 0], // ?????????????????????????????????????????? [?????????????????????]
        // },
        // ??????X????????????
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#282828",
          },
          show: true,
        },

        // AH - ??????X????????????
        splitNumber: 5, //????????????????????????echart?????????????????????
        minInterval: 1, //????????????
        maxInterval: 6, //??????????????????????????????????????????????????????6
      },
      yAxis: {
        // ?????????Y??????
        // axisLine: {
        //   show: false,
        // },
        type: componentConfChartJson.yAxis.type || "value",
        data: componentConfChartJson.yAxis.data || undefined,
        name: componentConfChartJson.yAxis.name || "", // ??????Y????????????
        max: componentConfChartJson.yAxis.max || undefined,
        min: componentConfChartJson.yAxis.min || undefined,
        unit: componentConfChartJson.yAxis.unit || "",
        twoYAxis: componentConfChartJson.yAxis.twoYAxis || undefined,
        nameTextStyle: {
          align: "left",
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#282828",
          },
          show: true,
        },

        axisLine: {
          lineStyle: {
            type: "solid",
            //color: "#686d74",
          },
          show: true,
        },
      },
      series: [],
      pie: componentConfChartJson.pie,
    };
    console.log(componentConf.data.type);
    console.log(componentConf.data.api.url);
    if (componentConf.data.type === "api" && componentConf.data.api.url) {
      // console.log(57429794759)
      this.getChartData(componentConf, chartJson);
    } else if (
      componentConf.data.json &&
      JSON.stringify(componentConf.data.json) != "{}"
    ) {
      console.log(componentConf.data.json);
      this.initChartOptions(componentConf.data.json, chartJson);
    } else {
      let demoDataObj = demoData[this.chartType];
      this.initChartOptions(demoDataObj.data || {});
    }
  };

  getChartData = (componentConf, chartJson) => {
    const dataApiObj = componentConf.data.api;
    const url = dataApiObj.url;
    const isTimeseries = dataApiObj.isTimeseries;
    const params = dataApiObj.params.equipmentsParams;
    const allParams = dataApiObj.params;

    if (isTimeseries) {
      let queryStr = SET_QUERY_TIME_SERIES_DATA(params);
      console.log(queryStr);
      let query = {
        url: url,
        method: "post",
        params: {
          query: queryStr,
        },
      };
      QueryApi.axiosApi((res) => {
        console.log(res, "resssssssssssss");
        this.initChartOptions(res.data, chartJson);
      }, query);
    }
  };

  initChartOptions = (obj, chartJson) => {
    console.log("initChartOptions", chartJson);
    console.log(obj);
    let componentConf = this.getComponentConf();
    console.log(chartJson);

    chartJson = {
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: "line",
          smooth: true,
        },
      ],
    };
    // this.$store.dispatch("updateComponentchartJson", chartJson);
    this.loadEChart(chartJson);
    // console.log(chartJson);
  };

  loadEChart = (chartJson) => {
    console.log(chartJson);
    const myChart = echarts.init(
      document.getElementById(this.props.domId),
      this.state.theme || "dark",
      {
        renderer: "svg",
      }
    );
    myChart.clear();
    myChart.setOption(chartJson);
    this.Ref = React.createRef(myChart);
    // this.$nextTick(() => {
    //   let dom = document.getElementById(this.domId);
    //   if (!dom) {
    //     return;
    //   }
    //   if (this.myChart === null) {
    //     this.myChart = echarts.init(
    //       document.getElementById(this.domId),
    //       this.theme || "dark",
    //       {
    //         renderer: "svg",
    //       }
    //     );
    //   }
    //   this.myChart.clear();
    //   this.myChart.setOption(chartJson);
    // });
  };

  componentDidMount = () => {
    this.getComponentConf();
  };

  getComponentConf = () => {
    var json = require("../../assets/demoEChartData.json");
    this.setState({ componentConf: json });
    return json;
  };

  loadEChart = (chartJson) => {
    console.log(chartJson);
    const myChart = echarts.init(
      document.getElementById(this.props.domId),
      this.state.theme || "dark",
      {
        renderer: "svg",
      }
    );
    myChart.clear();
    myChart.setOption(chartJson);
    this.Ref = React.createRef(myChart);
    // this.$nextTick(() => {
    //   let dom = document.getElementById(this.domId);
    //   if (!dom) {
    //     return;
    //   }
    //   if (this.myChart === null) {
    //     this.myChart = echarts.init(
    //       document.getElementById(this.domId),
    //       this.theme || "dark",
    //       {
    //         renderer: "svg",
    //       }
    //     );
    //   }
    //   this.myChart.clear();
    //   this.myChart.setOption(chartJson);
    // });
  };

  render() {
    console.log(this.props.style);
    return (
      <div>
        <div
          id={this.props.domId}
          ref={this.Ref}
          style={
            this.Ref.current !== null
              ? {
                  width: this.Ref.current.clientHeight,
                  height: this.Ref.current.clientWidth,
                }
              : {
                  width: "400px",
                  height: "800px",
                }
          }
        ></div>
      </div>
    );
  }
}

export default () => {
  return (
    <Provider store={store}>
      <EChartS domId={"DDDDDDD"}></EChartS>
    </Provider>
  );
};
