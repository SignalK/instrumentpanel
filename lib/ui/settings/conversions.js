/*
 * Copyright 2017 Teppo Kurki <teppo.kurki@iki.fi>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import Qty from 'js-quantities'
import { Dropdown } from 'react-bootstrap';

var conversions = {
  "m/s": {
    "kn": Qty.swiftConverter("m/s", "kn"),
    "km/h": Qty.swiftConverter("m/s", "km/h")
  },
  "kg": {
    "pound": Qty.swiftConverter("kg", "pound"),
    "metric ton": Qty.swiftConverter("kg", "metric-ton"),
  },
  "m3": {
    "liter": Qty.swiftConverter("m^3", "liter"),
    "gallon": Qty.swiftConverter("m^3", "gallon"),
    "gallon (imp)": Qty.swiftConverter("m^3", "gallon-imp"),
  },
  "m3/s": {
    "l/min": Qty.swiftConverter("m^3/s", "liter/minute"),
    "l/h": Qty.swiftConverter("m^3/s", "liter/hour"),
    "g/min": Qty.swiftConverter("m^3/s", "gallon/minute"),
    "g/h": Qty.swiftConverter("m^3/s", "gallon/hour")
  },
  "K": {
    "C": Qty.swiftConverter("tempK", "tempC"),
    "F": Qty.swiftConverter("tempK", "tempF")
  },
  "Hz": {
    "1/min": function (hz) {
      return hz * 60;
    },
    "rpm": function (hz) {
      return hz * 60;
    },
    "10/min": function (hz) {
      return hz * 60 / 10;
    },
    "100/min": function (hz) {
      return hz * 60 / 100;
    },
    "rpmX100": function (hz) {
      return hz * 60 / 100;
    },
    "1000/min": function (hz) {
      return hz * 60 / 1000;
    },
    "rpmX1000": function (hz) {
      return hz * 60 / 1000;
    }
  },
  "m": {
    "fathom": Qty.swiftConverter('m', 'fathom'),
    "feet": Qty.swiftConverter('m', 'foot'),
    "km": Qty.swiftConverter('m', 'km'),
    "nm": Qty.swiftConverter('m', 'nmi'),
  },
  "Pa": {
    "hPa": Qty.swiftConverter('pascal', 'hPa'),
    "bar": Qty.swiftConverter('pascal', 'bar'),
    "mbar": Qty.swiftConverter('pascal', 'millibar'),
    "psi": Qty.swiftConverter('pascal', 'psi'),
    "mmHg": Qty.swiftConverter('pascal', 'mmHg'),
    "inHg": Qty.swiftConverter('pascal', 'inHg'),
  },
  "s": {
    "minutes": Qty.swiftConverter('s', 'minutes'),
    "hours": Qty.swiftConverter('s', 'hours'),
    "days": Qty.swiftConverter('s', 'days')
  },
  "rad/s": {
    "deg/s": Qty.swiftConverter('rad/s', 'deg/s'),
    "deg/min": Qty.swiftConverter('rad/s', 'deg/min')
  },
  "ratio": {
    "%": function (ratio) {
      return ratio * 100;
    }
  },
  "rad": {
    "deg": Qty.swiftConverter('rad', 'deg')
  },
  "UTC": {
    "UTC-12": function (dateTime) { return dateTime - 12 * 3600000; },
    "UTC-11": function (dateTime) { return dateTime - 11 * 3600000; },
    "UTC-10": function (dateTime) { return dateTime - 10 * 3600000; },
    "UTC-9:30": function (dateTime) { return dateTime - 9 * 3600000 - 1800000; },
    "UTC-9": function (dateTime) { return dateTime - 9 * 3600000; },
    "UTC-8": function (dateTime) { return dateTime - 8 * 3600000; },
    "UTC-7": function (dateTime) { return dateTime - 7 * 3600000; },
    "UTC-6": function (dateTime) { return dateTime - 6 * 3600000; },
    "UTC-5": function (dateTime) { return dateTime - 5 * 3600000; },
    "UTC-4": function (dateTime) { return dateTime - 4 * 3600000; },
    "UTC-3:30": function (dateTime) { return dateTime - 3 * 3600000 - 1800000; },
    "UTC-3": function (dateTime) { return dateTime - 3 * 3600000; },
    "UTC-2": function (dateTime) { return dateTime - 2 * 3600000; },
    "UTC-1": function (dateTime) { return dateTime - 1 * 3600000; },
    "DST": function (dateTime) { return dateTime - (new Date(dateTime).getTimezoneOffset() * 60 * 1000); },
    "UTC+1": function (dateTime) { return dateTime + 1 * 3600000; },
    "UTC+2": function (dateTime) { return dateTime + 2 * 3600000; },
    "UTC+3": function (dateTime) { return dateTime + 3 * 3600000; },
    "UTC+3:30": function (dateTime) { return dateTime + 3 * 3600000 + 1800000; },
    "UTC+4": function (dateTime) { return dateTime + 4 * 3600000; },
    "UTC+4:30": function (dateTime) { return dateTime + 4 * 3600000 + 1800000; },
    "UTC+5": function (dateTime) { return dateTime + 5 * 3600000; },
    "UTC+5:30": function (dateTime) { return dateTime + 5 * 3600000 + 1800000; },
    "UTC+5:45": function (dateTime) { return dateTime + 5 * 3600000 + 2700000; },
    "UTC+6": function (dateTime) { return dateTime + 6 * 3600000; },
    "UTC+6:30": function (dateTime) { return dateTime + 6 * 3600000 + 1800000; },
    "UTC+7": function (dateTime) { return dateTime + 7 * 3600000; },
    "UTC+8": function (dateTime) { return dateTime + 8 * 3600000; },
    "UTC+8:45": function (dateTime) { return dateTime + 8 * 3600000 + 2700000; },
    "UTC+9": function (dateTime) { return dateTime + 9 * 3600000; },
    "UTC+9:30": function (dateTime) { return dateTime + 9 * 3600000 + 1800000; },
    "UTC+10": function (dateTime) { return dateTime + 10 * 3600000; },
    "UTC+10:30": function (dateTime) { return dateTime + 10 * 3600000 + 1800000; },
    "UTC+11": function (dateTime) { return dateTime + 11 * 3600000; },
    "UTC+11:30": function (dateTime) { return dateTime + 11 * 3600000 + 1800000; },
    "UTC+12": function (dateTime) { return dateTime + 12 * 3600000; },
    "UTC+12:45": function (dateTime) { return dateTime + 12 * 3600000 + 2700000; },
    "UTC+13": function (dateTime) { return dateTime + 13 * 3600000; },
    "UTC+14": function (dateTime) { return dateTime + 14 * 3600000; },
  },
  "C": {
    "Ah": Qty.swiftConverter('coulomb', 'Ah')
  },
  "J": {
    "Wh": Qty.swiftConverter('joule', 'Wh'),
    "BTU": Qty.swiftConverter('joule', 'btu')
  }
}

export function conversionsToItems(unit) {
  const conversionsForUnit = conversions[unit];
  if (conversionsForUnit) {
    return Object.keys(conversionsForUnit).map((targetUnit) => {
      return (
        <Dropdown.Item key={targetUnit}>{targetUnit}</Dropdown.Item>
      )
    });
  }
}

export function unitChoice(unit, onUnitChange, convertTo) {
  return (
    <span>
      <b>{unit}</b> show in &nbsp;
      <select onChange={onUnitChange} value={convertTo || unit}>
        <option key={unit} value={unit}>{unit}</option>
        {conversionsToOptions(unit)}
      </select>
      <br />
    </span>
  )
}

export function getConversionsList() {
  return Object.keys(conversions);
}

export function getConversion(srcUnit, dstUnit) {
  if (typeof conversions[srcUnit] === 'undefined') return undefined;
  const conversion = conversions[srcUnit][dstUnit];
  if (typeof conversion !== 'function') return undefined;
  return function (value) {
    try {
      return conversion(value);
    }
    catch (error) {
      return 'NaN';
    }
  }
}

export function safeNumber(value) {
  return ((typeof value !== 'number') || isNaN(value)) ? 0 : value;
}
