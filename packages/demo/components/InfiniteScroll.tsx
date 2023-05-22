import * as React from "react";
import { ListChildComponentProps } from "react-window";
import {
  DynamicSizeList,
  Props as DynamicSizeListProps,
} from "./DynamicSizeList";
import { UseItem } from "@/libs/useInfiniteQuery";
import AutoSizer from "react-virtualized-auto-sizer";

export type ItemProps<I, D> = Partial<ListChildComponentProps<D>> & {
  item: I;
};

export type LoadingProps<D> = Partial<ListChildComponentProps<D>>;

export type ErrorProps<D> = Partial<ListChildComponentProps<D>> & {
  error: Error;
};

type ItemComponents<I, D, R> = {
  Item: React.ComponentType<ItemProps<I, D> & React.RefAttributes<R>>;
  Loading: React.ComponentType<LoadingProps<D> & React.RefAttributes<R>>;
  Error: React.ComponentType<ErrorProps<D> & React.RefAttributes<R>>;
};

export type Props<I, D, R = HTMLElement> = Omit<
  DynamicSizeListProps<D>,
  "children" | "width" | "height"
> &
  ItemComponents<I, D, R> & {
    useItem: UseItem<I>;
    width?: number;
    height?: number;
  };

export default function InfiniteScroll<I, D, R = HTMLElement>({
  Item: _Item,
  Loading,
  Error,
  width,
  height,
  itemCount,
  itemKey: _itemKey,
  itemData: _itemData,
  useItem,
  ...rest
}: Props<I, D, R>): React.ReactElement {
  const itemData = React.useMemo(
    (): ItemData<I, D, R> => ({
      Item: _Item,
      Loading,
      Error,
      useItem,
      itemData: _itemData,
    }),
    [_Item, Loading, Error, _itemData, useItem]
  );

  const itemKey = React.useCallback(
    (index: number, data: ItemData<I, D, R>) =>
      _itemKey && data.itemData ? _itemKey(index, data.itemData) : index,
    [_itemKey]
  );

  return (
    <AutoSizer>
      {(size) => (
        <DynamicSizeList
          {...rest}
          itemCount={itemCount}
          height={height ?? size.height ?? 0}
          width={width ?? size.width ?? 0}
          itemKey={itemKey}
          itemData={itemData}
        >
          {Item}
        </DynamicSizeList>
      )}
    </AutoSizer>
  );
}

type ItemData<I, D, R> = ItemComponents<I, D, R> & {
  useItem: UseItem<I>;
  itemData?: D;
};

const Item = React.forwardRef<
  HTMLDivElement,
  ListChildComponentProps<ItemData<any, any, any>>
>(function Row(
  {
    index,
    style,
    isScrolling,
    data: { Item: _Item, Loading, Error, useItem, itemData },
  }: ListChildComponentProps<ItemData<any, any, any>>,
  ref
): React.ReactElement | null {
  const item = useItem(index);
  switch (item?.status) {
    case "loaded":
      return (
        <_Item
          index={index}
          data={itemData}
          item={item.data}
          style={style}
          isScrolling={isScrolling}
          ref={ref}
        />
      );
    case "loading":
      return (
        <Loading
          index={index}
          data={itemData}
          style={style}
          isScrolling={isScrolling}
          ref={ref}
        />
      );
    case "error":
      return (
        <Error
          index={index}
          data={itemData}
          style={style}
          isScrolling={isScrolling}
          error={item.error}
          ref={ref}
        />
      );
  }
  return null;
});
