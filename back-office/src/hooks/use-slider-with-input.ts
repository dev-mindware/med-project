import { useState, useCallback } from "react";

interface UseSliderWithInputProps {
  minValue: number;
  maxValue: number;
  initialValue: number[];
}

export function useSliderWithInput({
  minValue,
  maxValue,
  initialValue,
}: UseSliderWithInputProps) {
  const [sliderValue, setSliderValue] = useState<number[]>(initialValue);
  const [inputValues, setInputValues] = useState<string[]>(
    initialValue.map((v) => v.toString())
  );

  const handleSliderChange = useCallback((newValue: number[]) => {
    setSliderValue(newValue);
    setInputValues(newValue.map((v) => v.toString()));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const newInputs = [...inputValues];
      newInputs[index] = e.target.value;
      setInputValues(newInputs);
    },
    [inputValues]
  );

  const validateAndUpdateValue = useCallback(
    (value: string, index: number) => {
      let num = parseFloat(value);
      if (isNaN(num)) num = minValue;
      num = Math.max(minValue, Math.min(maxValue, num));

      const newValues = [...sliderValue];
      newValues[index] = num;
      setSliderValue(newValues);
      setInputValues(newValues.map((v) => v.toString()));
    },
    [minValue, maxValue, sliderValue]
  );

  return {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  };
}
