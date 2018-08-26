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

var conversions = {
  "m/s": {
    "kn": Qty.swiftConverter("m/s", "kn"),
    "km/h": Qty.swiftConverter("m/s", "km/h")
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
    "1/min": function(hz) {
      return hz * 60;
    },
    "10/min": function(hz) {
      return hz * 60 / 10;
    },
    "100/min": function(hz) {
      return hz * 60 / 100;
    },
    "1000/min": function(hz) {
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
    "mmHg": Qty.swiftConverter('pascal', 'mmHg')
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
    "%": function(ratio) {
      return ratio * 100;
    }
  },
  "rad": {
    "deg": Qty.swiftConverter('rad', 'deg')
  }
}


export function getConversionsForUnit(unit) {
  return conversions[unit]
}

export function conversionsToOptions(unit) {
  const conversions = getConversionsForUnit(unit);
  if (conversions) {
    return Object.keys(conversions).map((targetUnit) => {
      return (
        <option key={targetUnit} value={targetUnit}>{targetUnit}</option>
      )
    });
  }
}

export function unitChoice(unit, onUnitChange, convertTo){
  return (
    <span>
    <b>{unit}</b> show in
    <select onChange={onUnitChange} value={convertTo || unit}>
      <option key={unit} value={unit}>{unit}</option>
      {conversionsToOptions(unit)}
    </select>
    <br/>
    </span>
  )
}
