// @flow
import * as React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Responsive } from "react-grid-layout";

type ReactRef<T: HTMLElement> = {|
  +current: T | null
  |};

type WPDefaultProps = {|
  measureBeforeMount: boolean,
    onComponentDidMount: (gridWidth: number, breakpoint: string) => void
    |};

// eslint-disable-next-line no-unused-vars
type WPProps = {|
  className?: string,
    style ?: Object,
  ...WPDefaultProps
  |};

type WPState = {|
  width: number
    |};

type ComposedProps<Config> = {|
  ...Config,
  measureBeforeMount ?: boolean,
  className ?: string,
  style ?: Object,
  width ?: number
    |};

const layoutClassName = "react-grid-layout";

/*
 * A simple HOC that provides facility for listening to container resizes.
 *
 * The Flow type is pretty janky here. I can't just spread `WPProps` into this returned object - I wish I could - but it triggers
 * a flow bug of some sort that causes it to stop typechecking.
 */
export default function WidthProvideRGL<Config>(
  ComposedComponent: React.AbstractComponent<Config>
): React.AbstractComponent<ComposedProps<Config>> {
  return class WidthProvider extends React.Component<
    ComposedProps<Config>,
    WPState
  > {
    static defaultProps: WPDefaultProps = {
      measureBeforeMount: false,
      reduceWidth: 0,
      onComponentDidMount: 0
    };

    static propTypes = {
      // If true, will not render children until mounted. Useful for getting the exact width before
      // rendering, to prevent any unsightly resizing.
      measureBeforeMount: PropTypes.bool,
      reduceWidth: PropTypes.number,
      onComponentDidMount: PropTypes.func
    };

    state: WPState = {
      width: 1280
    };

    elementRef: ReactRef<HTMLDivElement> = React.createRef();
    mounted: boolean = false;

    componentDidMount() {
      this.mounted = true;
      window.addEventListener("resize", this.onWindowResize);
      // Call to properly set the breakpoint and resize the elements.
      // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
      // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll` on your body.
      this.onWindowResize();
      const node = this.elementRef.current;
      if (node instanceof HTMLElement && node.offsetWidth) {
        if (typeof this.props.onComponentDidMount === 'function') {
          var breakpoint = Responsive.utils.getBreakpointFromWidth(this.props.breakpoints, node.offsetWidth)
          var nbCols = this.props.cols[breakpoint]
          this.props.onComponentDidMount(node.offsetWidth, breakpoint, nbCols)
        }
      }
    }

    componentWillUnmount() {
      this.mounted = false;
      window.removeEventListener("resize", this.onWindowResize);
    }

    onWindowResize = () => {
      if (!this.mounted) return;
      const node = this.elementRef.current; // Flow casts this to Text | Element
      // fix: grid position error when node or parentNode display is none by window resize
      // #924 #1084
      if (node instanceof HTMLElement && node.offsetWidth) {
        this.setState({ width: node.offsetWidth });
      }
    };

    render() {
      const newWidth = this.state.width - this.props.reduceWidth;
      const { measureBeforeMount, ...rest } = this.props;
      if (measureBeforeMount && !this.mounted) {
        return (
          <div
            className={clsx(this.props.className, layoutClassName)}
            style={this.props.style}
            // $FlowIgnore ref types
            ref={this.elementRef}
          />
        );
      }
      return (
        <ComposedComponent
          innerRef={this.elementRef}
          {...rest}
          {...this.state}
          {...{ 'width': newWidth }}
        />
      );
    }
  };
}
