import * as React from "react";
import { Range } from "react-range";

class Slider extends React.Component {
  state = { values: [this.props.value] };

  handleChange = (values) => {
    this.setState({ values });
    this.props.changeValue(values[0]);
  };

  render() {
    return (
      <Range
        step={1}
        min={0}
        max={this.props.max}
        values={this.state.values}
        onChange={(values) => this.handleChange(values)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "6px",
              width: "100%",
              backgroundColor: "#ccc",
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "42px",
              width: "42px",
              backgroundColor: "#999",
            }}
          />
        )}
      />
    );
  }
}

export default Slider;
