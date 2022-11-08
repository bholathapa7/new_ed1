/* eslint-disable max-lines */
import * as Sentry from '@sentry/browser';
import React, {
  FC, MutableRefObject, ReactNode, memo, useCallback, useLayoutEffect, useMemo, useRef, useState, useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import ArrowSVG from '^/assets/icons/contents-list/arrow.svg';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, UseState, useL10n, typeGuardESSModel, typeGuardGroup, useDeleteContent, UseDeleteContent } from '^/hooks';
import { ChangeSelectedESSModelId, GetESSModelsByCategory, nameLanguageMapper } from '^/store/duck/ESSModels';
import * as T from '^/types';

const Root = styled.div({
  display: 'flex',
  padding: '10px',
  width: '100%',
  userSelect: 'none',
  color: dsPalette.typePrimary.toString(),
});

const ModelsContainer = styled.div({
  width: '100%',
});

const Categories = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '4px',
});

const ScrollableCategories = styled.ul({
  height: '28px',
  display: 'flex',
  justifyContent: 'flex-start',
  width: 'calc(100% - 20px)',
  margin: '0 10px',
  overflowX: 'hidden',
});

const CategoryItem = styled.li<{ isSelected?: boolean }>({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '0 18px',
  marginRight: '4px',
  borderRadius: '5px',
  fontSize: '14px',
  listStyle: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',

  '&:hover': {
    backgroundColor: dsPalette.categoryHover.toString(),
  },
}, ({ isSelected }) => ({
  backgroundColor: isSelected ? dsPalette.categorySelect.toString() : 'transparent',
}));

const Content = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '108px',
});

const ScrollableContent = styled.ul({
  position: 'relative',
  display: 'flex',
  justifyContent: 'flex-start',
  width: 'calc(100% - 20px)',
  margin: '0 10px',
  overflowX: 'hidden',
});

const ModelItem = styled.li<{ isSelected?: boolean }>({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',

  listStyle: 'none',

  width: '105px',
  height: '105px',
  marginRight: '4px',
  borderRadius: '5px',

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: dsPalette.categoryHover.toString(),
  },
}, ({ isSelected }) => ({
  backgroundColor: isSelected ? dsPalette.categorySelect.toString() : 'transparent',
}));

const ModelThumbnail = styled.img({
  width: '57px',
  minHeight: '43px',
  margin: '6px 19px',
});

const ModelLabel = styled.span({
  fontSize: '12px',
  lineHeight: '15px',
});

const ModelDetail = styled.span({
  fontSize: '10px',
  lineHeight: '15px',
});

const LeftScrollArrowIcon = styled(ArrowSVG)({
  transform: 'rotate(90deg)',
});

const RightScrollArrowIcon = styled(ArrowSVG)({
  transform: 'rotate(-90deg)',
});

const ScrollButton = styled.button<{ isDisplayed: boolean }>({
  padding: '4px 11px',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  borderRadius: '4px',

  ':hover': {
    backgroundColor: dsPalette.categoryHover.toString(),
  },

  svg: {
    marginBottom: '3px',
  },
}, ({ isDisplayed }) => ({
  display: isDisplayed ? 'block' : 'none',
}));

const SpinnerWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
});

interface ScrollButtonDisplay {
  left: boolean;
  right: boolean;
}

const SCROLL_AMOUNT: number = 108;
const SCROLL_STEP: number = 30;

const detailLanguageMapper: { [T.Language.KO_KR]: 'detailKo'; [T.Language.EN_US]: 'detailEn' } = {
  [T.Language.KO_KR]: 'detailKo',
  [T.Language.EN_US]: 'detailEn',
};

const getSelectedModelIds: (s: T.State) => Array<T.ESSModelInstance['id']> | undefined = (s) => {
  if (s.ESSModels.byCategory === undefined) return;

  return s.ESSModels.byCategory[s.ESSModels.selectedCategoryId ?? NaN];
};

const initialScrollButtonDisplayState: ScrollButtonDisplay = {
  left: false,
  right: false,
};

const ESSModelsList: FC = () => {
  const dispatch: Dispatch = useDispatch();
  const [, language]: UseL10n = useL10n();

  const [isDragStart, setDragStart] = useState<boolean>(false);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const categoriesRef: MutableRefObject<HTMLUListElement | null> = useRef(null);
  const modelsRef: MutableRefObject<HTMLUListElement | null> = useRef(null);
  const [categoriesScrollDisplay, setCategoriesScrollDisplay]: UseState<ScrollButtonDisplay> = useState(initialScrollButtonDisplayState);
  const [modelsScrollDisplay, setModelsScrollDisplay]: UseState<ScrollButtonDisplay> = useState(initialScrollButtonDisplayState);

  const categories: T.ESSModelsState['categories'] = useSelector((s: T.State) => s.ESSModels.categories);

  const selectedCategoryId: T.ESSModelsState['selectedCategoryId'] = useSelector((s: T.State) => s.ESSModels.selectedCategoryId);

  const selectedModelId: T.ESSModelsState['selectedModelId'] = useSelector((s: T.State) => s.ESSModels.selectedModelId);
  const editingContentId: T.ContentsPageState['editingContentId'] = useSelector((s: T.State) => s.Pages.Contents.editingContentId);
  const allContents = useSelector((s: T.State) => s.Contents.contents.byId);
  const printingContentId = useSelector((s: T.State) => s.Pages.Contents.printingContentId);
  const editingContent = editingContentId ? allContents[editingContentId] : undefined;
  const ESSModelContent = typeGuardESSModel(editingContent);
  const GroupContent: T.GroupContent | undefined = ESSModelContent?.groupId ? typeGuardGroup(allContents[ESSModelContent.groupId]) : undefined;
  const areModelsLoaded: boolean = useSelector((s: T.State) => getSelectedModelIds(s) !== undefined);

  const selectedModelsByCategories: T.ESSModelInstance[] | undefined = useSelector((s: T.State) =>
    getSelectedModelIds(s)?.reduce<T.ESSModelInstance[]>((total, id) => {
      const instance: T.ESSModelInstance | undefined = s.ESSModels.byId?.[id];

      if (instance === undefined) {
        // This means somehow the id that is saved on byId
        // is not the same as the id saved on byCategory.
        // It should never happen.
        const message: string = `The ESS model id: ${id} does not belong to the ESS model category: ${s.ESSModels.selectedCategoryId}`;
        // eslint-disable-next-line no-console
        console.error(message);
        Sentry.captureMessage(message);
      } else {
        total.push(instance);
      }

      return total;
    }, [])
  );

  const selectCategory: (id: T.ESSModelCategory['id']) => () => void = useCallback((id) => () => {
    dispatch(GetESSModelsByCategory({ categoryId: id }));
  }, []);

  const selectModel: (id: T.ESSModelInstance['id']) => () => void = useCallback((id) => () => {
    dispatch(ChangeSelectedESSModelId({ id: id === selectedModelId ? undefined : id }));
  }, [selectedModelId]);

  const deleteContent: UseDeleteContent = useDeleteContent();

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === T.TagName.INPUT) return;
    if ((e.target as HTMLElement).isContentEditable) return;
    if (ESSModelContent === undefined) return;
    if (printingContentId) return;
    e.preventDefault();
    if (e.ctrlKey && e.key === T.HotKey.C) {
      dispatch(ChangeSelectedESSModelId({ id: ESSModelContent.info.modelId }));
    } else if (e.key === T.HotKey.DELETE) {
      if (!GroupContent?.info.isOpened) return;
      deleteContent(ESSModelContent.id, ESSModelContent.type);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const onWheel: (e: React.WheelEvent<HTMLDivElement>) => void = (e) => {
    const domRef = categoriesRef.current;
    if (domRef) {
      if (e.deltaY === 0) return;
      e.preventDefault();
      domRef.scrollBy({
        left: e.deltaY < 0 ? -SCROLL_STEP : SCROLL_STEP,
      });
      resetCategoriesScrollButtonDisplay();
    }
  };

  const onMouseDown: (e: React.DragEvent<HTMLUListElement>) => void = (e) => {
    if (e.button !== 0) return;
    setDragStart(true);
    setScrollPosition(e.pageX);
  };

  const onMouseMove: (e: React.MouseEvent<HTMLUListElement>) => void = (e) => {
    const ele = categoriesRef.current;
    if (isDragStart && ele) {
      ele.scrollBy({
        left: scrollPosition < e.clientX ? -SCROLL_STEP : SCROLL_STEP,
      });
      resetCategoriesScrollButtonDisplay();
    }
  };

  const ESSSelectableCategories: ReactNode = useMemo(() => categories?.map((category) => {
    const categoryName: T.ESSModelCategory['nameKo'] | T.ESSModelCategory['nameEn'] = category[nameLanguageMapper[language]];

    return (
      <CategoryItem
        key={category.id}
        isSelected={selectedCategoryId === category.id}
        onClick={selectCategory(category.id)}
        data-ddm-track-action={'ess-model-category-list-click'}
        data-ddm-track-label={`${categoryName}-${category.id}`}
      >
        {category[nameLanguageMapper[language]]}
      </CategoryItem>
    );
  }), [categories, selectedCategoryId]);

  const ESSSelectableModels: ReactNode = useMemo(() => {
    if (selectedModelsByCategories === undefined) {
      return (
        <SpinnerWrapper>
          <LoadingIcon />
        </SpinnerWrapper>
      );
    }

    const models: ReactNode = selectedModelsByCategories.map((instance) => {
      const detailName: T.ESSModelInstance['detailEn'] | T.ESSModelInstance['detailKo'] = instance[detailLanguageMapper[language]];
      const labelName: T.ESSModelInstance['nameEn'] | T.ESSModelInstance['nameKo'] = instance[nameLanguageMapper[language]];

      return (
        <ModelItem
          key={instance.id}
          onClick={selectModel(instance.id)}
          isSelected={instance.id === selectedModelId}
          data-ddm-track-action={'ess-model-list-click'}
          data-ddm-track-label={`${labelName}-${instance.id}`}
        >
          <ModelThumbnail src={instance.thumbnailUrl} />
          <ModelLabel>{labelName}</ModelLabel>
          {detailName ? <ModelDetail>{detailName}</ModelDetail> : undefined}
        </ModelItem>
      );
    });

    return (
      <ScrollableContent ref={modelsRef}>
        {models}
      </ScrollableContent>
    );
  }, [selectedModelsByCategories, selectedModelId]);

  const resetCategoriesScrollButtonDisplay: () => void = () => {
    setCategoriesScrollDisplay((prevState) => {
      if (categoriesRef.current === null) return prevState;
      const elem: HTMLUListElement = categoriesRef.current;

      return {
        left: elem.scrollLeft !== 0,
        right: elem.scrollLeft + elem.offsetWidth < elem.scrollWidth,
      };
    });
  };

  const resetModelsScrollButtonDisplay: () => void = () => {
    setModelsScrollDisplay((prevState) => {
      if (modelsRef.current === null) return prevState;
      const elem: HTMLUListElement = modelsRef.current;

      return {
        left: elem.scrollLeft !== 0,
        right: elem.scrollLeft + elem.offsetWidth < elem.scrollWidth,
      };
    });
  };

  const resetModelsScroll: () => void = () => {
    if (categoriesRef.current === null) return;

    categoriesRef.current.scrollLeft = 0;
  };

  const scrollModelsContent: (amount: number) => () => void = (amount) => () => {
    if (modelsRef.current === null) return;

    modelsRef.current.scrollLeft += amount;
    resetModelsScrollButtonDisplay();
  };

  const scrollCategoriesContent: (amount: number) => () => void = (amount) => () => {
    if (categoriesRef.current === null) return;

    categoriesRef.current.scrollLeft += amount;
    resetCategoriesScrollButtonDisplay();
  };

  useLayoutEffect(() => {
    const resetScrollableContainer: () => void = () => {
      // Use rAF to avoid triggering too often,
      // only when it's needed.
      window.requestAnimationFrame(() => {
        resetCategoriesScrollButtonDisplay();
        resetModelsScrollButtonDisplay();
      });
    };

    if (categories !== undefined) {
      resetCategoriesScrollButtonDisplay();

      window.addEventListener('resize', resetScrollableContainer);
    }

    return () => {
      if (categories !== undefined) {
        window.removeEventListener('resize', resetScrollableContainer);
      }
    };
  }, [categories !== undefined]);

  useLayoutEffect(() => {
    if (areModelsLoaded) {
      resetModelsScroll();
      resetModelsScrollButtonDisplay();
    }
  }, [areModelsLoaded]);

  // When models have already been loaded, above hook won't trigger.
  // Trigger when the category is changed instead.
  useLayoutEffect(() => {
    resetModelsScrollButtonDisplay();
  }, [selectedCategoryId]);

  if (categories === undefined) {
    return (
      <SpinnerWrapper>
        <LoadingIcon />
      </SpinnerWrapper>
    );
  }

  return (
    <Root>
      <ModelsContainer onWheel={onWheel}>
        <Categories>
          <ScrollButton
            isDisplayed={categoriesScrollDisplay.left}
            style={{ marginLeft: '10px' }}
            onClick={scrollCategoriesContent(-SCROLL_AMOUNT)}
          >
            <LeftScrollArrowIcon />
          </ScrollButton>
          <ScrollableCategories
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={() => setDragStart(false)}
            ref={categoriesRef}
          >
            {ESSSelectableCategories}
          </ScrollableCategories>
          <ScrollButton
            isDisplayed={categoriesScrollDisplay.right}
            style={{ marginLeft: 'auto' }}
            onClick={scrollCategoriesContent(SCROLL_AMOUNT)}
          >
            <RightScrollArrowIcon />
          </ScrollButton>
        </Categories>
        <Content>
          <ScrollButton
            isDisplayed={modelsScrollDisplay.left}
            style={{ marginLeft: '10px' }}
            onClick={scrollModelsContent(-SCROLL_AMOUNT)}
          >
            <LeftScrollArrowIcon />
          </ScrollButton>
          {ESSSelectableModels}
          <ScrollButton
            isDisplayed={modelsScrollDisplay.right}
            style={{ marginLeft: 'auto' }}
            onClick={scrollModelsContent(SCROLL_AMOUNT)}
          >
            <RightScrollArrowIcon />
          </ScrollButton>
        </Content>
      </ModelsContainer>
    </Root>
  );
};

export default memo(ESSModelsList);
