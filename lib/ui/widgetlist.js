var rb = require('react-bootstrap');
var React = require('react');
var _ = require('lodash');

var Table = rb.Table,
    tr = rb.tr,
    td =rb.td,
    form = rb.form,
    Input = rb.Input;

var WidgetRow = require('./widgetrow');



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
            return <WidgetRow key={i} widget={widget}></WidgetRow> 
         })        
      }
      </tbody>
      </Table>  
      </div>  
    );
  },
  toggleActive: function(widget) {
    widget.setActive(!widget.active);
    this.setState(this.state);  
  },
  handleSelect: function(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  },

});


module.exports = WidgetList;

