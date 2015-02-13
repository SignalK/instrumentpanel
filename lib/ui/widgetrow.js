  var rb = require('react-bootstrap');
var React = require('react');
var _ = require('lodash');

var Table = rb.Table,
    tr = rb.tr,
    td =rb.td,
    form = rb.form,
    Input = rb.Input;


var WidgetRow = React.createClass({
  render: function() {
    return (
            <tr>
            <td><Input type="checkbox" label="&nbsp;" checked={this.props.widget.active} onChange={this.toggleActive}/></td>
            <td>{this.props.widget.getType()}</td>
            <td>{this.props.widget.getReactElement()}</td>
            <td><ul>{this.props.widget.getHandledPaths().map(function(path){
              return <li>{path}</li>
            })}</ul></td>
            </tr> 
    );
  },
  toggleActive: function() {
    this.props.widget.setActive(!this.props.widget.active);
  },
  handleSelect: function(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  }
});


module.exports = WidgetRow;