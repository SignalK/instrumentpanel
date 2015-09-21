var rb = require('react-bootstrap');
var React = require('react');

var TabbedArea = rb.TabbedArea,
    TabPane = rb.TabPane,
    Button = rb.Button;

var DataItemList = require('./dataitemlist')
var WidgetList = require('./widgetlist')
var GridJson = require('./gridjson')


var SettingsPanel = React.createClass({
  getInitialState: function() {
    return {
      activeKey: 1
    }
  },
  render: function() {
    return (
    <div>
      <Button 
        className="pull-right"
        onClick={this.reset}>Reset all</Button>
      <TabbedArea activeKey={this.state.activeKey} onSelect={this.handleSelect}>
        <TabPane eventKey={1} tab="By Display Widget">
          <WidgetList instrumentPanel={this.props.instrumentPanel}/>
        </TabPane>
        <TabPane eventKey={2} tab="By Data Item">
          <DataItemList instrumentPanel={this.props.instrumentPanel}/>
        </TabPane>
        <TabPane eventKey={3} tab="Grid as JSON">
          <GridJson model={this.props.instrumentPanel.gridSettingsModel}/>
        </TabPane>
      </TabbedArea>
    </div>
    );
  },
  handleSelect: function(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  },
  reset: function() {
    localStorage.clear();
    location.reload();
  }
});


module.exports = SettingsPanel;

