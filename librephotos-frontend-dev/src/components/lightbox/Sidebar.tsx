import { ActionIcon, Avatar, Badge, Box, Button, Group, Stack, Text, Textarea, Title } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "react-virtualized/styles.css";
import { push } from "redux-first-history";
// only needs to be imported once
import { Edit, Map2, Note, Photo, Tags, Users, X } from "tabler-icons-react";

import { generatePhotoIm2txtCaption, savePhotoCaption } from "../../actions/photosActions";
import type { Photo as PhotoType } from "../../actions/photosActions.types";
import { searchPhotos } from "../../actions/searchActions";
import { serverAddress } from "../../api_client/apiClient";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { LocationMap } from "../LocationMap";
import { Tile } from "../Tile";
import { ModalPersonEdit } from "../modals/ModalPersonEdit";
import { TimestampItem } from "./TimestampItem";
import { VersionComponent } from "./VersionComponent";

type Props = {
  isPublic: boolean;
  photoDetail: PhotoType;
  closeSidepanel: () => void;
};

export function Sidebar(props: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [personEditOpen, setPersonEditOpen] = useState(false);
  const [selectedFaces, setSelectedFaces] = useState<any[]>([]);
  const { fetchingPhotoDetail } = useAppSelector(store => store.photos);
  const { generatingCaptionIm2txt } = useAppSelector(store => store.photos);
  const { photoDetail, isPublic, closeSidepanel } = props;

  const [imageCaption, setImageCaption] = useState("");
  const { width } = useViewportSize();
  const SCROLLBAR_WIDTH = 15;
  let LIGHTBOX_SIDEBAR_WIDTH = 320;

  useEffect(() => {
    if (!fetchingPhotoDetail) {
      const currentCaption =
        photoDetail.captions_json.user_caption && photoDetail.captions_json.user_caption.length > 0
          ? photoDetail.captions_json.user_caption
          : photoDetail.captions_json.im2txt;

      setImageCaption(currentCaption);
    } else {
      setImageCaption("");
    }
  }, [photoDetail, fetchingPhotoDetail]);

  if (width < 600) {
    LIGHTBOX_SIDEBAR_WIDTH = width - SCROLLBAR_WIDTH;
  }
  return (
    <Box
      sx={theme => ({
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        padding: theme.spacing.sm,
      })}
      style={{
        right: 0,
        top: 0,
        float: "right",
        width: LIGHTBOX_SIDEBAR_WIDTH,
        height: window.innerHeight,
        whiteSpace: "normal",
        position: "fixed",
        overflowY: "scroll",
        overflowX: "hidden",
        zIndex: 250,
      }}
    >
      {photoDetail && !fetchingPhotoDetail && (
        <Stack>
          <Group position="apart">
            <Title order={3}>Details</Title>
            <ActionIcon
              onClick={() => {
                closeSidepanel();
              }}
            >
              <X />
            </ActionIcon>
          </Group>
          {/* Start Item Time Taken */}
          <TimestampItem photoDetail={photoDetail} />
          {/* End Item Time Taken */}
          {/* Start Item File Path */}
          <VersionComponent photoDetail={photoDetail} />
          {/* End Item File Path */}
          {/* Start Item Location */}

          {photoDetail.search_location && (
            <Stack>
              <Title order={4}>
                <Map2 /> {t("lightbox.sidebar.location")}
              </Title>
              <Text>{photoDetail.search_location}</Text>
            </Stack>
          )}

          <div
            style={{
              width: LIGHTBOX_SIDEBAR_WIDTH - 70,
              whiteSpace: "normal",
              lineHeight: "normal",
            }}
          >
            {photoDetail.exif_gps_lat && <LocationMap photos={[photoDetail]} />}
          </div>

          {/* End Item Location */}
          {/* Start Item People */}

          {photoDetail.people.length > 0 && (
            <Stack>
              <Group>
                <Users />
                <Title order={4}>{t("lightbox.sidebar.people")}</Title>
              </Group>
              {photoDetail.people.map(nc => (
                <Group position="center" spacing="xs">
                  <Button
                    variant="subtle"
                    leftIcon={<Avatar radius="xl" src={serverAddress + nc.face_url} />}
                    onClick={() => {
                      dispatch(searchPhotos(nc.name));
                      dispatch(push("/search"));
                    }}
                  >
                    <Text align="center" size="sm">
                      {nc.name}
                    </Text>
                  </Button>
                  <ActionIcon
                    onClick={() => {
                      setSelectedFaces([{ face_id: nc.face_id, face_url: nc.face_url }]);
                      setPersonEditOpen(true);
                    }}
                    variant="light"
                  >
                    <Edit size={17} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          )}

          {/* End Item People */}
          {/* Start Item Caption */}

          <Stack>
            <Group>
              <Note />
              <Title order={4}>{t("lightbox.sidebar.caption")}</Title>
            </Group>
            {false && photoDetail.captions_json.im2txt}
            <Stack>
              <Textarea value={imageCaption} disabled={isPublic} onChange={e => setImageCaption(e.target.value)} />
              <Group>
                <Button
                  onClick={() => {
                    dispatch(savePhotoCaption(photoDetail.image_hash, imageCaption));
                  }}
                  disabled={isPublic}
                  size="sm"
                  color="green"
                >
                  {t("lightbox.sidebar.submit")}
                </Button>
                <Button
                  loading={generatingCaptionIm2txt}
                  onClick={() => {
                    dispatch(generatePhotoIm2txtCaption(photoDetail.image_hash));
                  }}
                  disabled={isPublic || (generatingCaptionIm2txt != null && generatingCaptionIm2txt)}
                  size="sm"
                  color="blue"
                >
                  {t("lightbox.sidebar.generate")}
                </Button>
              </Group>
            </Stack>
          </Stack>

          {/* End Item Caption */}
          {/* Exif Data */}

          {/* Start Item Scene */}
          {photoDetail.captions_json.places365 && (
            <Stack>
              <Group>
                <Tags />
                <Title order={4}>{t("lightbox.sidebar.scene")}</Title>
              </Group>
              <Text weight={700}>{t("lightbox.sidebar.attributes")}</Text>
              <Group>
                {photoDetail.captions_json.places365.attributes.map(nc => (
                  <Badge
                    key={`lightbox_attribute_label_${photoDetail.image_hash}_${nc}`}
                    color="blue"
                    onClick={() => {
                      dispatch(searchPhotos(nc));
                      dispatch(push("/search"));
                    }}
                  >
                    {nc}
                  </Badge>
                ))}
              </Group>

              <Text weight={700}>{t("lightbox.sidebar.categories")}</Text>
              <Group>
                {photoDetail.captions_json.places365.categories.map(nc => (
                  <Badge
                    key={`lightbox_category_label_${photoDetail.image_hash}_${nc}`}
                    color="teal"
                    onClick={() => {
                      dispatch(searchPhotos(nc));
                      dispatch(push("/search"));
                    }}
                  >
                    {nc}
                  </Badge>
                ))}
              </Group>
            </Stack>
          )}
          {/* End Item Scene */}
          {/* Start Item Similar Photos */}
          {photoDetail.similar_photos.length > 0 && (
            <div>
              <Group>
                <Photo />
                <Title order={4}>{t("lightbox.sidebar.similarphotos")}</Title>
              </Group>
              <Text>
                <Group spacing="xs">
                  {photoDetail.similar_photos.slice(0, 30).map(el => (
                    <Tile video={el.type.includes("video")} height={85} width={85} image_hash={el.image_hash} />
                  ))}
                </Group>
              </Text>
            </div>
          )}
          {/* End Item Similar Photos */}
        </Stack>
      )}
      <ModalPersonEdit
        isOpen={personEditOpen}
        onRequestClose={() => {
          setPersonEditOpen(false);
          setSelectedFaces([]);
        }}
        selectedFaces={selectedFaces}
      />
    </Box>
  );
}
