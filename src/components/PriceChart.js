import React, { Component } from "react";
import { connect } from 'react-redux';
import Chart from 'react-apexcharts'
import { priceChartLoadedSelector, priceChartSelector } from "../store/selectors";
import { chartOptions } from './PriceChart.config'

import Spinner from './Spinner'

const priceSymbol = (lastPriceChange) => {
    let output
    if (lastPriceChange === '+') {
        output = <span className="text-success">&#9650;</span>
    } else {
        output = <span className="text-danger">&#9550;</span>
    }
    return(output)
}

const showPriceChart = (priceChart) => {
    console.log(priceChart)
    return(
        <div className="price-chart">
            <div className="price">
                <h4>DAPP/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}</h4>
            </div>
            <Chart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='100%'/>
        </div>
    )
}

class PriceChart extends Component {
    render() {
        return (<div className="card bg-dark text-white">
            <div className="card-header">
              PriceChart
            </div>
            <div className="card-body">
                { this.props.priceChartLoaded ? showPriceChart(this.props.priceChart) : <Spinner type="div" /> }
            </div>
        </div>)
    }
}

function mapStateToProps(state) {
    return {
        priceChart: priceChartSelector(state),
        priceChartLoaded: priceChartLoadedSelector(state)
    }
}
  
export default connect(mapStateToProps)(PriceChart);