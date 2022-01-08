import { select, selectAll } from 'd3v4';

const d3 = {
  select,
  selectAll,
};

(function () {
  'use strict';

  //#region SUGÓK

  const texts = {
    'help-map': {
      title: 'A <i>Quality of Life</i> a Föld körül',
      para: 'Fontos megjegyezni, hogy a <i>Numbeo</i> valójában városokra lebontva gyűjt adatokat, azonban ezeket átlagolva (súlyozott, az adott városból való kitöltők számával) országokra vonatkozó statisztikát is publikál, ezek kerültek itt ábrázolásra. A legelső ábra lényege, hogy általános betekintést nyújtson az életminőség aktuális állásába a különböző években, amikor a mutatószámat számolták. Minél sötétebb a terület, annál nagyobb a mutatószám értéke, illetve annál jobb az életminőség az adott országban. Hozzávetőlegesen 70-80 országra vonatkozóan állnak rendelkezésünkre adatok. Az ábra segítségével vizuálisan könnyen összehasonlíthatóvá válnak a különböző területek, egyértelművé válik, hogy az életminőség Nyugat-Amerikában és Európában a legnagyobb, illetve Afrikában a legkisebb, de az ázsiai országok sem állnak túl jól.',
    },
    'help-components': {
      title: 'A <i>Quality of Life</i> összetevői',
      para: `A második ábra tömör lényege, hogy országonként értelmezhetővé váljon az, hogy mitől is függ a mutatószám alakulása az egyes években, melyek azok a mutatószám komponensek, amelyek csökkentik, illetve melyek amelyek növelik azt. Fontos megjegyezni, hogy nem az itt található indexek egyszerű átlagaként, hanem súlyozott átlagaként számolandó ki a mutatószám eredeti értéke, ez évenként különböző, a következő linken <a href="https://www.numbeo.com/quality-of-life/indices_explained.jsp" target="_blank" class="link">megtekinthető</a>. A különböző komponensek értelmezése és magyarázata következő:
      <ul style="padding-left: 3rem">
        <li>Vásárlóerő index &mdash; ha egy adott ország X vásárlóerővel rendelkezik, az azt jelenti, hogy (100 - X)%-al kevesebb terméket és szolgáltatást vásárolhatnak meg, mint amennyit New York-ban megvásárolhatnának, az adott országbeli átlagfizetéssel.</li>
        <li>Biztonsági index &mdash; kérdőíves felmérés alapján megállapított bűnőzési szint, amennyiben 20 alatti biztonságos országról beszélünk, illetve ahogy növekedik, úgy egyre kevésbé biztonságos.</li>
        <li>Egészségügyi index &mdash; kérdőíves felmérés alapján megállapított egészségügy minőség, minél nagyobb annál jobb, egy becsült szám az egészségügy átlagminőségéről, magába foglalva az orvosokat, felszereléseket, infrastruktúrát, stb.</li>
        <li>Megélhetési index &mdash; ha egy adott ország X megélhetési index-el rendelkezik, az azt jelenti, hogy (100 - X)%-al alacsonyabbak az árak, mint New York-ban.</li>
        <li>Jövedelem-ingatlanár arány &mdash; mennyire elérhetőek az ingatlanok az átlagemberek számára, évben kifejezve mennyit kell dolgozni, általában úgy számolják, hogy a median ingatlanárat viszonyítják a medián rendelkezésre álló jövedelemhez.</li>
        <li>Ingázási idő index &mdash; összetett mutató, amely magába foglalja, hogy mennyibe időbe telik egyirányúan eljutni egy személynek a munkahelyére, percekben számolva, de ezek mellett, az emberi "kényelmetlenséget" is méri, ami feltételezi, hogy minden utazással töltött perc exponenciálisan növeli az emberi kényelmetlenséget, amennyiben az utazással töltött idő meghaladja a 25 percet; emellett illetve CO<sub>2</sub> kibocsájtást is magába foglal.</li>
        <li>Szennyezettségi index &mdash; kérdőívek alapján felmért becsült jelenlevő szennyezettség egy adott országban, ahol a legnagyobb súlya a légszennyezésnek van, ezt követi a víz, de egyéb faktorokat is magába foglal.</li>
        <li>Klíma index &mdash; mennyire kedvelhető az átlagember által az adott ország éghajlata, -100 és 100 közötti mutatószám, amely 2015-től képezi a részét, amennyiben egy adott ország 100-as index-el rendelkezik az azt jelenti, hogy mérsékelt hőmérsékletek uralkodnak, alacsony páratartalommal és semmi olyan időjárási kondicióval, ami a legtöbb ember számára elviselhetetlen vagy kellemetlen.</li>
      </ul>`,
    },
    'help-regression': {
      title: 'A <i>Quality of Life</i> összefüggései a GNI/fővel',
      para: 'Az utolsó ábra lényege, hogy szemléltesse egy gazdasági és egy nem gazdasági alapokon álló mutatószám közötti összefüggést, évekre lebontva, amelyek esetében mindkettő valamilyen formában az adott országban létező életminőség felmérésére használható. A másodfokú polinomiális regressziós összefüggésből kiderül az, hogy a GNI növekedése egy adott értékig növeli az országban fellelhető, valamilyen szinten minden évben, nagyrészt szubjektív alapokra helyezett életminőséget, azonban egy adott érték után már kevésbé befolyásolja.',
    },
  };

  const modal = d3.select('.modal');

  d3.selectAll('.help').on('click', function () {
    modal.select('.modal--title').html(texts[d3.select(this).attr('id')]['title']);
    const nextElemHtml = texts[d3.select(this).attr('id')]['para'];

    if (nextElemHtml.includes('</ul>')) {
      modal.select('.modal--content').style('max-width', '75%');
    } else {
      modal.select('.modal--content').style('max-width', '50%');
    }

    modal.select('.modal--para').html(nextElemHtml);
    modal.attr('class', `${modal.attr('class')} active`);
  });

  const modalBackground = modal.select('.modal--background');
  modalBackground.on('click', function () {
    modal.attr('class', 'modal');
  });

  //#endregion
})();
