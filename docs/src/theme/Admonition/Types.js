import React from 'react';
import clsx from 'clsx';
import DefaultTypes from '@theme-original/Admonition/Types';
import AdmonitionLayout from '@theme/Admonition/Layout';

function ExerciseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function Exercise(props) {
  const title = props.title !== null && props.title !== undefined ? props.title : 'Try it yourself';
  return (
    <AdmonitionLayout
      type="exercise"
      icon={<ExerciseIcon />}
      className={clsx('alert alert--success alert--exercise', props.className)}
      title={title}>
      {props.children}
    </AdmonitionLayout>
  );
}

export default {
  ...DefaultTypes,
  exercise: Exercise,
};
