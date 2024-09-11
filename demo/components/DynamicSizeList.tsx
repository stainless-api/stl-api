import * as React from "react";
import {
  ListChildComponentProps,
  VariableSizeList,
  VariableSizeListProps,
} from "react-window";
import useMeasure from "react-use-measure";

export type Props<T> = Omit<
  VariableSizeListProps<T>,
  "itemSize" | "children"
> & {
  children: React.ComponentType<ListChildComponentProps<T> & { ref: any }>;
  minItemSize?: number;
  onTotalSizeChange?: (totalSize: number) => any;
};

type State = {
  itemSizes: number[];
  lastIndex: number | null;
};

export function DynamicSizeList<T>({
  children: Children,
  layout,
  minItemSize = 0,
  itemCount,
  onTotalSizeChange,
  ...props
}: Props<T>): React.ReactElement {
  const [state, dispatch] = React.useReducer(
    (
      state: State,
      action:
        | { type: "setItemSize"; index: number; size: number }
        | { type: "clearLastIndex" }
    ): State => {
      switch (action.type) {
        case "clearLastIndex":
          return state.lastIndex == null
            ? state
            : { ...state, lastIndex: null };
        case "setItemSize": {
          const { index, size } = action;
          if (state.itemSizes[index] === size) return state;
          const itemSizes = [...state.itemSizes];
          itemSizes[index] = size;
          return {
            itemSizes,
            lastIndex:
              state.lastIndex == null
                ? index
                : Math.min(state.lastIndex, index),
          };
        }
        default:
          return state;
      }
    },
    { itemSizes: [], lastIndex: null }
  );
  const { itemSizes, lastIndex } = state;
  const itemSizesRef = React.useRef(itemSizes);
  itemSizesRef.current = itemSizes;
  const itemSize = React.useCallback(
    (index: number) => itemSizesRef.current[index] || minItemSize || 0,
    [minItemSize]
  );
  const totalSize = React.useMemo((): number => {
    return (
      itemSizes.reduce(
        (total, next) => total + Math.max(next || 0, minItemSize),
        0
      ) +
      minItemSize * Math.max(0, itemCount - itemSizes.length)
    );
  }, [itemCount, minItemSize, itemSizes]);
  React.useEffect((): void | (() => void) => {
    onTotalSizeChange?.(totalSize);
  }, [totalSize, onTotalSizeChange]);

  const Row = React.useCallback(
    function MeasuredRow(
      rowProps: ListChildComponentProps<any>
    ): React.ReactElement {
      const [ref, bounds] = useMeasure();
      const size = layout === "horizontal" ? bounds?.width : bounds?.height;
      React.useEffect(() => {
        if (size != null && size > 0) {
          dispatch({
            type: "setItemSize",
            index: rowProps.index,
            size,
          });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [size]);

      return (
        <div style={rowProps.style}>
          <Children {...rowProps} style={{}} ref={ref} />
        </div>
      );
    },
    [Children, layout]
  );

  const listRef = React.useRef<VariableSizeList<any> | null>(null);
  const list = listRef.current;

  React.useEffect(() => {
    if (list && lastIndex != null) {
      list.resetAfterIndex(lastIndex);
      dispatch({ type: "clearLastIndex" });
    }
  }, [list, lastIndex]);

  return (
    <VariableSizeList
      {...props}
      ref={listRef}
      layout={layout}
      itemSize={itemSize}
      itemCount={itemCount}
    >
      {Row}
    </VariableSizeList>
  );
}
