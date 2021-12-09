import {
  select,
  selectAll
} from 'd3v4';

const d3 = {
  select,
  selectAll
};

(function () {
  'use strict';

  //#region SUGÓK

  const texts = {
    'help-map': {
      'title': 'A <i>Quality of Life</i> a Föld körül',
      'para': 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Neque tempora fugiat mollitia at commodi. Recusandae nisi quia deleniti quod ullam a ipsum vero odit minima maxime cum suscipit, sapiente alias?'
    },
    'help-components': {
      'title': 'A <i>Quality of Life</i> összetevői',
      'para': 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Neque tempora fugiat mollitia at commodi. Recusandae nisi quia deleniti quod ullam a ipsum vero odit minima maxime cum suscipit, sapiente alias?'
    },
    'help-regression': {
      'title': 'A <i>Quality of Life</i> összefüggései a GDP/fővel',
      'para': 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Neque tempora fugiat mollitia at commodi. Recusandae nisi quia deleniti quod ullam a ipsum vero odit minima maxime cum suscipit, sapiente alias?'
    }
  }

  const modal = d3.select('.modal');

  d3.selectAll('.help').on('click', function () {
    modal.select('.modal--title').html(texts[d3.select(this).attr('id')]['title']);
    modal.select('.modal--para').html(texts[d3.select(this).attr('id')]['para']);
    modal.attr('class', `${modal.attr('class')} active`);
  });

  const modalBackground = modal.select('.modal--background');
  modalBackground.on('click', function () {
    modal.attr('class', 'modal');
  });

  //#endregion

}());