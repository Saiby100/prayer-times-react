import type {
  RequestWidgetUpdateProps,
  WidgetInfo,
  WidgetRepresentation,
} from 'react-native-android-widget';
import { refreshWidgets } from '../refreshWidgets';

/** How many of each widget are on the home screen. */
let mockPlaced: Record<string, number> = {};
const mockRendered: { widgetName: string; widget: WidgetRepresentation }[] = [];
const mockLoadWidgetData = jest.fn();

jest.mock('react-native-android-widget', () => ({
  ...jest.requireActual('react-native-android-widget'),
  requestWidgetUpdate: async ({ widgetName, renderWidget }: RequestWidgetUpdateProps) => {
    for (let i = 0; i < (mockPlaced[widgetName] ?? 0); i++) {
      const widget = await renderWidget({ widgetName, widgetId: i } as WidgetInfo);
      mockRendered.push({ widgetName, widget });
    }
  },
}));

jest.mock('@/services/widgets/loadWidgetData', () => ({
  loadWidgetData: () => mockLoadWidgetData(),
}));

jest.mock('@/stores', () => ({
  getPickedThemeId: () => 'misty-valley',
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

/** The `data` prop the rendered widget was drawn with. */
function dataOf(widget: WidgetRepresentation) {
  const element = 'light' in widget ? widget.light : widget;
  return (element.props as { data: unknown }).data;
}

describe('refreshWidgets', () => {
  beforeEach(() => {
    mockPlaced = {};
    mockRendered.length = 0;
    mockLoadWidgetData.mockReset();
    mockLoadWidgetData.mockResolvedValue({ state: 'no-area', area: '' });
  });

  it('loads nothing when no widget is placed', async () => {
    await refreshWidgets();

    expect(mockLoadWidgetData).not.toHaveBeenCalled();
    expect(mockRendered).toHaveLength(0);
  });

  it('redraws every placed widget, loading the data once', async () => {
    mockPlaced = { NextPrayer: 2 };

    await refreshWidgets();

    expect(mockLoadWidgetData).toHaveBeenCalledTimes(1);
    expect(mockRendered.map((r) => r.widgetName)).toEqual(['NextPrayer', 'NextPrayer']);
    expect(dataOf(mockRendered[0].widget)).toEqual({ state: 'no-area', area: '' });
  });

  it('shows "not loaded" when loading fails', async () => {
    mockPlaced = { NextPrayer: 1 };
    mockLoadWidgetData.mockRejectedValue(new Error('offline'));

    await refreshWidgets();

    expect(dataOf(mockRendered[0].widget)).toEqual({ state: 'not-loaded', area: '' });
  });
});
