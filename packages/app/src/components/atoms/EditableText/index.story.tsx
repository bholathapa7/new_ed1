import { storiesOf } from '@storybook/react';
import React, { useEffect, useRef, useState, MutableRefObject, ChangeEvent, MouseEvent } from 'react';

import * as T from '^/types';
import { EditableText } from './';


const emptyLambda = () => {};
const useEditableTextForStorybook = () => {
  const ref: MutableRefObject<HTMLInputElement | null> = useRef(null);
  const [isTextEditing, setTextEditing] = useState(false);
  const text = 'sadfadsfdasfadsfsdf';
  const [hasError, setHasError] = useState(false);
  const [editingText, setEditingText] = useState(text);
  const handleTextChange: (e: ChangeEvent<HTMLInputElement>) => void = (e) => setEditingText(e.currentTarget.value);
  const handleTextDivClick = () => setTextEditing(() => true);
  const handleTextInputClick: (e: MouseEvent<HTMLDivElement>) => void = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (editingText === 'error') setHasError(() => true);
    else setHasError(() => false);
  }, [editingText]);


  return {
    ref, isTextEditing, editingText, text,
    hasError, setHasError,
    handleTextChange, handleTextDivClick, handleTextInputClick,
  };
};

storiesOf('Atoms|EditableText', module)
  .add('fromUI={T.EditableTextUI.CONTENT_TITLE}', () => {
    const {
      ref, isTextEditing, editingText, text,
      hasError,
      handleTextChange, handleTextDivClick, handleTextInputClick,
    } = useEditableTextForStorybook();


    return (
      <EditableText
        fromUI={T.EditableTextUI.CONTENT_TITLE}
        hasError={hasError}
        editingTextRef={ref}
        editingText={editingText}
        text={text}
        isTextEditable={true}
        isTextEditing={isTextEditing}
        isGenericName={false}
        handleTextDivClick={handleTextDivClick}
        handleTextKeyPress={emptyLambda}
        handleTextInputClick={handleTextInputClick}
        handleTextChange={handleTextChange}
      />
    );
  });

storiesOf('Atoms|EditableText', module)
  .add('fromUI={T.EditableTextUI.INPUT_L}', () => {
    const {
      ref, isTextEditing, editingText, text,
      hasError,
      handleTextChange, handleTextDivClick, handleTextInputClick,
    } = useEditableTextForStorybook();


    return (
      <EditableText
        fromUI={T.EditableTextUI.INPUT_L}
        hasError={hasError}
        editingTextRef={ref}
        editingText={editingText}
        text={text}
        isTextEditable={true}
        isTextEditing={isTextEditing}
        isGenericName={false}
        handleTextDivClick={handleTextDivClick}
        handleTextKeyPress={emptyLambda}
        handleTextInputClick={handleTextInputClick}
        handleTextChange={handleTextChange}
      />
    );
  });

storiesOf('Atoms|EditableText', module)
  .add('fromUI={T.EditableTextUI.INPUT_S}', () => {
    const {
      ref, isTextEditing, editingText, text,
      hasError,
      handleTextChange, handleTextDivClick, handleTextInputClick,
    } = useEditableTextForStorybook();


    return (
      <EditableText
        fromUI={T.EditableTextUI.INPUT_S}
        hasError={hasError}
        editingTextRef={ref}
        editingText={editingText}
        text={text}
        isTextEditable={true}
        isTextEditing={isTextEditing}
        isGenericName={false}
        handleTextDivClick={handleTextDivClick}
        handleTextKeyPress={emptyLambda}
        handleTextInputClick={handleTextInputClick}
        handleTextChange={handleTextChange}
      />
    );
  });

storiesOf('Atoms|EditableText', module)
  .add('fromUI={T.EditableTextUI.OL_CONTENT_TITLE}', () => {
    const {
      ref, isTextEditing, editingText, text,
      hasError,
      handleTextChange, handleTextDivClick, handleTextInputClick,
    } = useEditableTextForStorybook();


    return (
      <EditableText
        fromUI={T.EditableTextUI.OL_CONTENT_TITLE}
        hasError={hasError}
        editingTextRef={ref}
        editingText={editingText}
        text={text}
        isTextEditable={true}
        isTextEditing={isTextEditing}
        isGenericName={false}
        handleTextDivClick={handleTextDivClick}
        handleTextKeyPress={emptyLambda}
        handleTextInputClick={handleTextInputClick}
        handleTextChange={handleTextChange}
      />
    );
  });

storiesOf('Atoms|EditableText', module)
  .add('fromUI={T.EditableTextUI.TOPBAR}', () => {
    const {
      ref, isTextEditing, editingText, text,
      hasError,
      handleTextChange, handleTextDivClick, handleTextInputClick,
    } = useEditableTextForStorybook();


    return (
      <EditableText
        fromUI={T.EditableTextUI.TOPBAR}
        hasError={hasError}
        editingTextRef={ref}
        editingText={editingText}
        text={text}
        isTextEditable={true}
        isTextEditing={isTextEditing}
        isGenericName={false}
        handleTextDivClick={handleTextDivClick}
        handleTextKeyPress={emptyLambda}
        handleTextInputClick={handleTextInputClick}
        handleTextChange={handleTextChange}
      />
    );
  });

storiesOf('Atoms|EditableText', module)
  .add('error', () => {
    const {
      ref, isTextEditing, editingText, text,
      handleTextChange, handleTextDivClick, handleTextInputClick,
    } = useEditableTextForStorybook();


    return (
      <EditableText
        fromUI={T.EditableTextUI.CONTENT_TITLE}
        hasError={true}
        editingTextRef={ref}
        editingText={editingText}
        text={text}
        isTextEditable={true}
        isTextEditing={isTextEditing}
        isGenericName={false}
        handleTextDivClick={handleTextDivClick}
        handleTextKeyPress={emptyLambda}
        handleTextInputClick={handleTextInputClick}
        handleTextChange={handleTextChange}
      />
    );
  });


storiesOf('Atoms|EditableText', module)
  .add('altogether', () => {
    const {
      ref, isTextEditing, editingText, text,
      hasError,
      handleTextChange, handleTextDivClick, handleTextInputClick,
    } = useEditableTextForStorybook();

    const altogether =
     [
       T.EditableTextUI.CONTENT_TITLE,
       T.EditableTextUI.INPUT_L,
       T.EditableTextUI.INPUT_S,
       T.EditableTextUI.OL_CONTENT_TITLE,
       T.EditableTextUI.TOPBAR].map((ui) => (
       <div key={ui}>
         {ui}
         <EditableText
           fromUI={ui}
           hasError={hasError}
           editingTextRef={ref}
           editingText={editingText}
           text={text}
           isTextEditable={true}
           isTextEditing={isTextEditing}
           isGenericName={false}
           handleTextDivClick={handleTextDivClick}
           handleTextKeyPress={emptyLambda}
           handleTextInputClick={handleTextInputClick}
           handleTextChange={handleTextChange}
         />
       </div>
     ),
     );


    return (
      <div>
        <section>
          에러만들고 싶으면 <pre>error</pre>를 쳐보세요
        </section>
        <div>
          {altogether}
        </div>
      </div>
    );
  });
