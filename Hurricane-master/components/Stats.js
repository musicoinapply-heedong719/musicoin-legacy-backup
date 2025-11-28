import React from 'react';
import NumberFormat from 'react-number-format';
class StatsComponent extends React.Component {

  componentDidMount() {
    this.props.subscribeToMore();
  }

  render() {
    return (
        <h2 className="user__count">
          <span className="user__count-num"><NumberFormat value={this.props.stats ? this.props.stats.plays : 0} displayType={'text'} thousandSeparator={true}/></span>
          &nbsp;Played and paid by UBI,&nbsp;
          <span className="user__count-num"><NumberFormat value={this.props.stats ? this.props.stats.tips : 0} displayType={'text'} thousandSeparator={true}/></span> tips by fans.
        </h2>
    );
  }
}

export default StatsComponent;