'use client';
import React, {Fragment} from 'react';

import {Grid} from './Grid';

const GLOBAL_COMPONENT_LIST_TYPE = 'globalComponentList';

// Lazy load components
const COMPONENTS: {[key: string]: React.ComponentType<any>} = {
  grid: Grid,
};

// Define a type for the component shape
interface PageComponent {
  _type: string;
  _key: string;
  components?: PageComponent[];
  [key: string]: any;
}

const unfurlGlobalComponents = (
  components: PageComponent[] = [],
): PageComponent[] =>
  components.reduce(
    (
      componentsWithGlobalsUnfurled: PageComponent[],
      component: PageComponent,
    ) => {
      if (component._type === GLOBAL_COMPONENT_LIST_TYPE) {
        const globalComponents = component.components || [];
        return [...componentsWithGlobalsUnfurled, ...globalComponents];
      } else {
        return [...componentsWithGlobalsUnfurled, component];
      }
    },
    [],
  );

export default function PageComponentList({
  components = [],
  componentProps = {},
}: {
  components?: PageComponent[];
  componentProps?: Record<string, any>;
}) {
  const allComponents = unfurlGlobalComponents(components);

  const componentRows = allComponents.map((component, index) => {
    const Component = COMPONENTS[component._type];

    if (!Component)
      return (
        <div
          key={component._key}
          className="p-4 mt-80 mb-80 border border-solid"
        >
          missing - {component._type}
        </div>
      );

    return (
      <Component
        isFirst={index === 0}
        isLast={index === allComponents.length - 1}
        index={index}
        key={component._key}
        {...component}
        {...componentProps}
      />
    );
  });

  return <Fragment>{componentRows}</Fragment>;
}
