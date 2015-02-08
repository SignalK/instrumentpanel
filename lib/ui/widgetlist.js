var rb = require('react-bootstrap');
var React = require('react');
var _ = require('lodash');

var Table = rb.Table,
    tr = rb.tr,
    td =rb.td;



var WidgetList = React.createClass({
  getInitialState: function() {
    return {
      activeKey: 2
    }
  },
  render: function() {
    return (
      <div className="widgetlist">
      <Table striped bordered condensed hover>
      <tbody>
      {
          this.props.instrumentPanel.widgets.map(function(widget, i) {
            return <tr key={i}>
            <td>{widget.id}</td>
            <td>{widget.getType()}</td>
            <td>{widget.getReactElement()}</td>
            <td><ul>{widget.getHandledPaths().map(function(path){
              return <li>{path}</li>
            })}</ul></td>
            </tr> 
         })        
      }
      </tbody>
      </Table>  
      </div>  
    );
  },
  handleSelect: function(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  }
});


module.exports = WidgetList;

