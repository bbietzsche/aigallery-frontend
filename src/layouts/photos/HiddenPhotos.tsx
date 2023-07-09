import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EyeOff } from "tabler-icons-react";

import { fetchHiddenPhotos } from "../../actions/photosActions";
import { PhotoListView } from "../../components/photolist/PhotoListView";
import type { PhotosState } from "../../reducers/photosReducer";
import { PhotosetType } from "../../reducers/photosReducer";
import { useAppDispatch, useAppSelector } from "../../store/store";

export function HiddenPhotos() {
  const { fetchedPhotosetType, photosFlat, photosGroupedByDate } = useAppSelector(state => state.photos as PhotosState);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    if (fetchedPhotosetType !== PhotosetType.HIDDEN) {
      fetchHiddenPhotos(dispatch);
    }
  }, [dispatch]); // Only run on first render

  return (
    <PhotoListView
      title={t("photos.hidden")}
      loading={fetchedPhotosetType !== PhotosetType.HIDDEN}
      icon={<EyeOff size={50} />}
      photoset={photosGroupedByDate}
      idx2hash={photosFlat}
      selectable
    />
  );
}
